// Элементы страницы
const borrowForm = document.getElementById('borrow-form');
const bookInput = document.getElementById('book-title');
const readerInput = document.getElementById('reader-name');
const dateInput = document.getElementById('due-date');
const statusFilter = document.getElementById('status-filter');
const searchInput = document.getElementById('search-input');
const refreshButton = document.getElementById('refresh-button');
const infoBox = document.getElementById('info');
const borrowTable = document.getElementById('borrow-table');
const borrowBody = document.getElementById('borrow-body');
const counter = document.getElementById('counter');

const STATUS_NAMES = {
  issued: 'На руках',
  overdue: 'Просрочена',
  returned: 'Возвращена'
};

// Вспомогательные функции
function showInfo(text, isError) {
  infoBox.textContent = text;
  infoBox.className = isError ? 'message error-message' : 'message';
  infoBox.hidden = false;
}

function updateCounter() {
  const count = borrowBody.children.length;
  counter.textContent = count;
  borrowTable.hidden = (count === 0);
}

function addCell(row, text) {
  const cell = document.createElement('td');
  cell.textContent = text;
  row.appendChild(cell);
  return cell;
}

// Создание строки и кнопок действий
function createBorrowRow(borrow) {
  const row = document.createElement('tr');
  addCell(row, borrow.id);
  addCell(row, borrow.bookTitle);
  addCell(row, borrow.readerName);
  addCell(row, borrow.dueDate.split('-').reverse().join('.'));
  addCell(row, STATUS_NAMES[borrow.status]);

  row.setAttribute('data-id', borrow.id);
  row.setAttribute('data-status', borrow.status);
  // При отмене возврата восстанавливаем исходное состояние открытой выдачи.
  row.setAttribute('data-active-status', borrow.status === 'returned' ? 'issued' : borrow.status);
  row.classList.toggle('returned', borrow.status === 'returned');
  row.classList.toggle('overdue', borrow.status === 'overdue');

  const actions = document.createElement('td');
  const returnButton = document.createElement('button');
  returnButton.type = 'button';
  returnButton.textContent = borrow.status === 'returned' ? 'Отменить возврат' : 'Отметить возврат';
  returnButton.setAttribute('title', returnButton.textContent);
  returnButton.addEventListener('click', onReturnClick);
  actions.appendChild(returnButton);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = 'Удалить';
  deleteButton.className = 'danger';
  deleteButton.addEventListener('click', onDeleteClick);
  actions.appendChild(deleteButton);
  row.appendChild(actions);
  return row;
}

function onReturnClick(event) {
  const button = event.currentTarget;
  const row = button.closest('tr');
  const isReturned = row.classList.toggle('returned');
  const status = isReturned ? 'returned' : row.getAttribute('data-active-status');

  row.setAttribute('data-status', status);
  row.classList.toggle('overdue', status === 'overdue');
  row.children[4].textContent = STATUS_NAMES[status];
  button.textContent = isReturned ? 'Отменить возврат' : 'Отметить возврат';
  button.setAttribute('title', button.textContent);
  showInfo(isReturned ? 'Возврат отмечен' : 'Отметка о возврате отменена', false);
}

function onDeleteClick(event) {
  const row = event.currentTarget.closest('tr');
  if (!confirm('Удалить эту выдачу из таблицы?')) {
    return;
  }
  row.remove();
  updateCounter();
  showInfo(borrowBody.children.length === 0 ? 'Список выдач пуст' : 'Выдача удалена из таблицы', false);
}

// Отправка формы без перезагрузки страницы
function onFormSubmit(event) {
  event.preventDefault();
  const bookTitle = bookInput.value.trim();
  const readerName = readerInput.value.trim();
  const dueDate = dateInput.value;

  document.getElementById('error-book').textContent = bookTitle.length < 3 ? 'Введите название не короче 3 символов' : '';
  document.getElementById('error-reader').textContent = readerName ? '' : 'Введите ФИО читателя';
  document.getElementById('error-date').textContent = dueDate ? '' : 'Укажите срок возврата';
  if (bookTitle.length < 3 || !readerName || !dueDate) {
    return;
  }

  const borrow = { id: '-', bookTitle: bookTitle, readerName: readerName, dueDate: dueDate, status: 'issued' };
  borrowBody.insertBefore(createBorrowRow(borrow), borrowBody.firstChild);
  updateCounter();
  showInfo('Выдача оформлена в текущей таблице', false);
  borrowForm.reset();
}

// Получение данных через учебный API
async function loadBorrows(status, text) {
  const url = '/api/borrows?status=' + encodeURIComponent(status) + '&q=' + encodeURIComponent(text);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Ошибка сервера: ' + response.status);
  }
  return await response.json();
}

async function refreshList() {
  showInfo('Загрузка...', false);
  refreshButton.disabled = true;
  try {
    const items = await loadBorrows(statusFilter.value, searchInput.value.trim());
    borrowBody.textContent = '';
    for (let i = 0; i < items.length; i++) {
      borrowBody.appendChild(createBorrowRow(items[i]));
    }
    updateCounter();
    showInfo(items.length === 0 ? 'Выдачи не найдены. Измените фильтр или текст поиска.' : 'Загружено выдач: ' + items.length, false);
  } catch (error) {
    borrowBody.textContent = '';
    updateCounter();
    showInfo(error.message === 'Failed to fetch' ? 'Нет связи с сервером. Попробуйте загрузить список снова.' : 'Не удалось загрузить список. ' + error.message, true);
  } finally {
    refreshButton.disabled = false;
  }
}

borrowForm.addEventListener('submit', onFormSubmit);
refreshButton.addEventListener('click', refreshList);
statusFilter.addEventListener('change', refreshList);
searchInput.addEventListener('input', refreshList);

refreshList();

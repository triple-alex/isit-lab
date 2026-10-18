// Учебные выдачи. Состояния заданы заранее и не зависят от текущей даты.
const borrows = [
  { id: 1, bookTitle: 'Война и мир', readerName: 'Иванов Иван Иванович', dueDate: '2026-11-01', status: 'issued' },
  { id: 2, bookTitle: 'Капитанская дочка', readerName: 'Петров Пётр Петрович', dueDate: '2026-10-10', status: 'overdue' },
  { id: 3, bookTitle: 'Мастер и Маргарита', readerName: 'Смирнова Анна Сергеевна', dueDate: '2026-10-15', status: 'returned' },
  { id: 4, bookTitle: 'Преступление и наказание', readerName: 'Соколова Мария Андреевна', dueDate: '2026-11-05', status: 'issued' },
  { id: 5, bookTitle: 'Евгений Онегин', readerName: 'Кузнецов Дмитрий Павлович', dueDate: '2026-10-08', status: 'overdue' },
  { id: 6, bookTitle: 'Дубровский', readerName: 'Васильева Елена Олеговна', dueDate: '2026-10-16', status: 'returned' },
  { id: 7, bookTitle: 'Отцы и дети', readerName: 'Новиков Сергей Викторович', dueDate: '2026-11-08', status: 'issued' }
];

const ROUTES = {
  'GET /api/borrows': function (query) {
    return filterList(borrows, query);
  }
};

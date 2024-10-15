const { ipcRenderer } = require('electron');

let originalData = []; // Оригинальные данные из CSV
let currentData = []; // Содержит отредактированные данные

document.getElementById('openFile').addEventListener('click', async () => {
    const data = await ipcRenderer.invoke('open-file-dialog');
    if (!data) return;

    originalData = [...data]; // Сохраняем оригинальные данные
    currentData = [...data]; // Инициализируем текущие данные для редактирования
    renderTable(currentData); // Отображаем таблицу
    document.getElementById('reloadTable').disabled = false; // Активируем кнопку перезагрузки
    document.getElementById('saveFile').disabled = false;    // Активируем кнопку сохранения
});

document.getElementById('reloadTable').addEventListener('click', () => {
    currentData = [...originalData]; // Восстанавливаем текущие данные из оригинальных
    renderTable(currentData); // Перезагружаем таблицу
});

document.getElementById('saveFile').addEventListener('click', async () => {
    await ipcRenderer.invoke('save-file-dialog', currentData); // Сохранение отредактированных данных
});

function renderTable(data) {
    const tableHeaders = document.getElementById('tableHeaders');
    const tableBody = document.getElementById('tableBody');

    tableHeaders.innerHTML = '';
    tableBody.innerHTML = '';

    // Получаем заголовки
    const headers = Object.keys(data[0]);
    headers.forEach(header => {
        const th = document.createElement('th');
        th.innerText = header;
        tableHeaders.appendChild(th);
    });

    // Заполняем таблицу данными
    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        headers.forEach(header => {
            const td = document.createElement('td');
            td.innerText = row[header];
            tr.appendChild(td);
        });

        // Добавляем обработчик клика для удаления строки
        tr.addEventListener('click', () => {
            currentData.splice(rowIndex, 1); // Удаляем строку из текущего массива
            renderTable(currentData); // Перерисовываем таблицу
        });

        tableBody.appendChild(tr);
    });
}

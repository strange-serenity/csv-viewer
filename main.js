const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('open-file-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    });

    if (canceled) return;

    const results = [];
    const filePath = filePaths[0];

    return new Promise((resolve) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            });
    });
});

ipcMain.handle('save-file-dialog', async (event, data) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save CSV File',
        defaultPath: 'modified_table.csv',
        filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    });

    if (canceled) return;

    try {
        const json2csvParser = new Parser();
        const csvData = json2csvParser.parse(data);

        fs.writeFileSync(filePath, csvData);
    } catch (error) {
        console.error('Error saving file:', error);
    }
});

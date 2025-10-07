const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');

window.addEventListener('DOMContentLoaded', () => {
  fs.readdir('lyrics', (err, files) => {
    files.forEach(file => {
      const li = document.createElement('el');
      li.innerHTML += `<a onclick='window.electron.loadSong("${file}")'>${file.replace(/\.[^/.]+$/, "")}</a>`;
      document.querySelector('#song-list').appendChild(li);
    });
  });
})

ipcRenderer.on('newline', (event, arg) => {
  document.querySelector('#content').innerHTML = arg;
})

let lines = [];
let currentLineIndex = 0;

contextBridge.exposeInMainWorld(
  'electron',
  {
    nextLine: () => {
      if (currentLineIndex >= lines.length - 1) return;

      currentLineIndex++;
      updateCurrentLine();
    },
    prevLine: () => {
      if (currentLineIndex <= 0) return;

      currentLineIndex--;
      updateCurrentLine();
    },
    loadSong: (filename) => {
      fs.readFile('lyrics/' + filename, 'utf-8', (err, data) => {
        if (err)
          return console.log(err);

        data = data.replaceAll('\n\n', '\r\n\r\n');
        lines = data.split('\r\n\r\n');
        lines.unshift('<br>\n');
        document.querySelector('#lyrics').innerHTML = "";
        currentLineIndex = 0;
        let i = 0;
        lines.forEach(line => {
          line = line.trim().replace(/(?:\r\n|\r|\n)/g, '<br>');
          line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
          line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
          document.querySelector('#lyrics').innerHTML += `<li><a id='line${i}' class='songlines ${i === 0 ? ' currentline' : ''}' onclick='window.electron.showLine(${i})'>${line}</a></li>`;
          i++;
        });
      });
    },
    showLine: index => {
      currentLineIndex = index;
      updateCurrentLine();
    }
  }
)

function updateCurrentLine() {
  ipcRenderer.send('control-message', { title: 'nextline', index: currentLineIndex, line: lines[currentLineIndex].trim() });
  const selected = document.querySelectorAll('.currentline');
  selected.forEach(el => {
    el.classList.remove('currentline');
  });

  const currentlineEl = document.getElementById('line' + currentLineIndex);
  currentlineEl.classList.add('currentline');
  currentlineEl.scrollIntoView({ behavior: "smooth", block: "center" });
}
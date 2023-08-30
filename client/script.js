const fileList = document.getElementById('file-list');
const editorContainer = document.getElementById('editor');
const saveButton = document.getElementById('save-button');
const deleteButton = document.getElementById('delete-button');

let editor;

// 初始化 Monaco Editor
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor/min/vs' } });
require(['vs/editor/editor.main'], function () {
  editor = monaco.editor.create(editorContainer, {
    language: 'json',
    theme: 'vs-dark',
    fontSize: 16,
  });
});

// 获取文件列表
fetch('/files')
  .then(response => response.json())
  .then(files => {
    createFileList(fileList, files, '');
  });

// 创建文件列表
function createFileList(ul, files, path) {
  files.forEach(file => {
    const listItem = document.createElement('li');
    const filePath = path ? path + '/' + file.name : file.name;
    listItem.dataset.path = filePath;
    if (file.files) {
      listItem.textContent = file.name;
      const subList = document.createElement('ul');
      createFileList(subList, file.files, filePath);
      listItem.appendChild(subList);
    } else {
      listItem.textContent = file.name;
      listItem.addEventListener('click', () => {
        document.querySelectorAll('#file-list li').forEach(li => li.classList.remove('active'));
        listItem.classList.add('active');
        loadFile(filePath);
      });
    }
    ul.appendChild(listItem);
  });
}

// 加载文件
function loadFile(filePath) {
  fetch(`/files/${filePath}`)
    .then(response => response.json())
    .then(data => {
      editor.setValue(data.content);
    });
}

// 保存文件
saveButton.addEventListener('click', () => {
  const filePath = fileList.querySelector('.active').dataset.path;
  console.log(filePath);
  const content = editor.getValue();

  fetch(`/files/${filePath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  })
    .then(response => response.text())
    .then(message => {
      alert(message);
    });
});

// 删除文件
deleteButton.addEventListener('click', () => {
  const filePath = fileList.querySelector('.active').dataset.path;

  if (!confirm(`Are you sure you want to delete ${filePath}?`)) {
    return;
  }

  fetch(`/files/${filePath}`, {
    method: 'DELETE',
  })
    .then(response => response.text())
    .then(message => {
      alert(message);
      location.reload();
    });
});
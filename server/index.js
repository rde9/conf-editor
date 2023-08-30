const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 5001;
const DIR = process.env.DIR;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// 获取文件列表
app.get('/files', async (req, res) => {
  try {
    const files = await getFiles(DIR);
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 获取文件内容
app.get('/files/*', async (req, res) => {
  const filePath = path.join(DIR, req.params[0]);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 保存文件内容
app.post('/files/*', async (req, res) => {
  const filePath = path.join(DIR, req.params[0]);
  const content = req.body.content;

  try {
    await fs.writeFile(filePath, content, 'utf-8');
    res.send('File Saved');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 删除文件
app.delete('/files/*', async (req, res) => {
  const filePath = path.join(DIR, req.params[0]);

  try {
    await fs.unlink(filePath);
    res.send('File Deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 获取目录中的所有文件
async function getFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return getFiles(fullPath).then(files => ({ name: entry.name, path: fullPath, files }));
    } else {
      return { name: entry.name, path: fullPath };
    }
  }));
  return files;
}

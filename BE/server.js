const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { title } = require('process');
const { create } = require('domain');
const { json } = require('stream/consumers');
const app = express();

app.use(cors()); // FE gọi API
app.use(express.json()); // đọc file JSON (FE gửi lên)
const profilePath = path.join(__dirname,'data','profile.json');

// API - Đọc ghi thông tin profile

app.get('/api/profile', (req,res) =>
    {try {
        const rawData = fs.readFileSync(profilePath,'utf-8');
        const profile = JSON.parse(rawData);
        res.json(profile)
    } catch (error) {
        res.status(500).json({message: "Lỗi đọc file"});
    }
    }
)
// API - Cập nhật profile
app.put('/api/profile', (req,res) => {
    try{
        const newProfile = req.body;
        // Ghi đè dữ liệu mới
        fs.writeFileSync(profilePath,JSON.stringify(newProfile,null,2),'utf-8');
        res.json({success : true, message: "Đã cập nhật profile"});
    }
    catch(error){
        res.status(500).json({message: "Lỗi ghi file"});
    }
});

const PORT = 5000;
app.listen(PORT)

// MODULE: Quản lý ghi chú bình thường (public note)
// Author: Nguyễn Ngọc Trọng
// Date:
// Ghi chú: Nhóm API hỗ trợ CRUD cho ghi chú theo chủ đề.

// Cảnh báo xung đột:
// FE: Các API này nhận và trả về dữ liệu chuẩn JSON (key:value). Không đc tự ý sửa key
// BE: Nếu đổi đường dẫn, Phải báo PM

const notesDir = path.join(__dirname,'data','notes');
// Nếu thư mục không tồn tại thì tự động tạo
if (!fs.existsSync(notesDir))
{
    fs.mkdirSync(notesDir, {recursive : true});
}
const getFilePath = (topic) => path.join(notesDir, `${topic}.json`);
// GET - Lấy danh sách ghi chú
app.get('/api/notes/:topic',(req,res) => {
    const filePath = getFilePath(req.params.topic);
    try{
        if(!fs.existsSync(filePath)) return res.json([]);
        const data = fs.readFileSync(filePath,'utf-8');
        res.json(JSON.parse(data));
    }catch(error)
    {
        res.status(500).json({message: "Lỗi đọc danh sách ghi chú"});
    }
});
// POST - Thêm mới ghi chú
app.post('/api/notes/:topic',(req,res) => {
    const filePath = getFilePath(req.params.topic);
    try{
        let notes = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath,'utf-8')) : [];
        const newNote = {
            id: Date.now().toString(),
            title : req.body.title || "Không tiêu đề",
            content : req.body.content || "",
            createAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        notes.push(newNote);
        fs.writeFileSync(filePath,JSON.stringify(notes,null,2),'utf-8');
        res.json({success: true, note: newNote});
    }catch(error){
        res.status(500).json({message: "Lỗi thêm ghi chú"});
    }
});
// PUT - Sửa ghi chú
app.put('/api/notes/:topic/:id', (req, res) => { 
    const filePath = getFilePath(req.params.topic); 
    try { 
        let notes = JSON.parse(fs.readFileSync(filePath, 'utf8')); 
        const index = notes.findIndex(n => n.id === req.params.id); 
         
        if (index !== -1) { 
            notes[index].title = req.body.title; 
            notes[index].content = req.body.content; 
            notes[index].updatedAt = new Date().toISOString(); 
             
            fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf8'); 
            return res.json({ success: true, message: "Đã sửa thành công" }); 
        } 
        res.status(404).json({ message: "Không tìm thấy ghi chú" }); 
    } catch (error) { 
        res.status(500).json({ message: "Lỗi cập nhật ghi chú" }); 
    } 
});
// DELETE - Xóa Ghi Chú
app.delete('/api/notes/:topic/:id', (req, res) => { 
    const filePath = getFilePath(req.params.topic); 
    try { 
        let notes = JSON.parse(fs.readFileSync(filePath, 'utf8')); 
        const newNotes = notes.filter(n => n.id !== req.params.id); 
        fs.writeFileSync(filePath, JSON.stringify(newNotes, null, 2), 'utf8'); 
        res.json({ success: true, message: "Đã xóa thành công" }); }catch (error) { 
        res.status(500).json({ message: "Lỗi xóa ghi chú" }); 
    } 
});
/** 
 * ============================================================================ 
 * MODULE: BẢO MẬT & GHI CHÚ RIÊNG TƯ (PRIVATE NOTES) 
 * Author: [Điền tên Backend Dev] 
 * Date: [Ngày thực hiện] 
 * Description: API kiểm tra mật khẩu và quản lý file private.json 
 * ============================================================================ 
 */ 
const privateNotesFile = path.join(__dirname, 'data', 'private.json'); 
// Khởi tạo file private.json nếu chưa tồn tại 
if (!fs.existsSync(privateNotesFile)) { 
    fs.writeFileSync(privateNotesFile, '[]', 'utf8'); 
} 
// 1. API Xác thực mật khẩu 
app.post('/api/private/auth', (req, res) => { 
    try { 
        const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8')); 
        // Kiểm tra pass truyền lên có khớp với pass trong profile không 
        if (profile.password === req.body.password) { 
            res.json({ success: true }); 
        } else { 
            res.status(401).json({ success: false, message: "Sai mật khẩu!" }); 
        } 
    } catch (error) { 
        res.status(500).json({ message: "Lỗi hệ thống xác thực" }); 
    } 
}); 
// 2. API Lấy danh sách Ghi chú riêng tư 
app.get('/api/private/notes', (req, res) => { 
    try { 
        const data = fs.readFileSync(privateNotesFile, 'utf8'); 
        res.json(JSON.parse(data)); 
    } catch (error) { res.status(500).json({ message: "Lỗi đọc ghi chú riêng tư" }); 
    } 
}); 
// 3. API Thêm Ghi chú riêng tư 
app.post('/api/private/notes', (req, res) => { 
    try { 
        let notes = JSON.parse(fs.readFileSync(privateNotesFile, 'utf8')); 
        const newNote = { 
            id: Date.now().toString(), 
            title: req.body.title || "Lưu bút mật", 
            content: req.body.content || "", 
            createdAt: new Date().toISOString(), 
            updatedAt: new Date().toISOString() 
        }; 
        notes.push(newNote); 
        fs.writeFileSync(privateNotesFile, JSON.stringify(notes, null, 2), 'utf8'); 
        res.json({ success: true, note: newNote }); 
    } catch (error) { 
        res.status(500).json({ message: "Lỗi thêm ghi chú kín" }); 
    } 
}); 
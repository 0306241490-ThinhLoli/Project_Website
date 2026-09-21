const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors()); // FE gọi API
app.use(express.json()); // đọc file JSON (FE gửi lên)
const profilePath = path.join(__dirname,'data','profile.json');

// API - Đọc ghi thông tin profile

app.get('/api/profile', (req,res) =>
    {try {
        const rawData = fs.readFileSync(profilePath,'utf-8');
        const profile = JSON.parse(rawData);

    } catch (profile) {
        res.status(500).json({message: "Lỗi đọc file"});
    }
    }
)
// API - Cập nhật profile
app.put('api/profile', (req,res) => {
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
app.listen(PORT, () => console.log(`Backend chạy tại http://localhost:${PORT}`));
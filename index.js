const express = require('express');
const bodyparser = require('body-parser');
const axios = require("axios")
const cheerio = require("cheerio")
const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json("THESIEURE API MADE BY TTK")
});

app.post('/transferhistory', (req, res) => {
    var { cookies, type } = req.body;
    if (['in', 'out'].indexOf(type) == -1) return res.json({ error: true, message: 'Invalid type' });
    // in = nhận, out = chuyển
    if (!cookies) return res.json({ error: "Missing cookies" });
    axios({
        method: 'get',
        url: 'https://thesieure.com/wallet/transfer',
        headers: {
            'cookie': cookies
        }
    }).then((response) => {
        var typeClass = type == 'in' ? 'text-success' : 'text-danger';
        const $ = cheerio.load(response.data);
        const table = $('div.table-responsive:eq(1) > table > tbody > tr');
        var data = [];
        table.each((i, e) => {
            var td = $(e).find('td');
            var status = $(td).find('span').attr('class');
            if (typeClass.includes(status)) {
                data.push({
                    ma_giao_dich: $(td).eq(0).text(),
                    ngay_giao_dich: $(td).eq(3).text(),
                    trang_thai: $(td).eq(4).text().trim(),
                    tai_khoan_nhan_tien: $(td).eq(2).text().trim().trim().split('\n')[1].trim(),
                    noi_dung: $(td).eq(5).text().trim(),
                    amount: $(td).find(`span[class="${typeClass}"]`).text().trim()
                })
            }
        })
        res.status(200).json({
            status: 200,
            data: data
        });
    }).catch((error) => {
        res.status(500).json({ error: true, message: error.message });
    })
});

app.listen(process.env.PORT || 8080, () => console.log("Server started!"));

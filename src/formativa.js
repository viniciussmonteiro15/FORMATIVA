const express = require('express');
const app = express();
const pool = require('./config/database'); 

const queryAsync = (sql, values = []) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

app.get('/', (req, res) => {
    res.send("API SaborDigital - Restaurante Sabor & Saber");
});

app.get('/produtos', async (req, res) => {
    try {
        const produtos = await queryAsync('SELECT * FROM produto ORDER BY id DESC');
        res.json({
            sucesso: true,
            dados: produtos
        });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar produtos', erro: erro.message });
    }
});

app.get('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }

        const produto = await queryAsync('SELECT * FROM produto WHERE id = ?', [id]);

        if (produto.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
        }

        res.json({ sucesso: true, dados: produto[0] });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar produto' });
    }
});

app.post('/produtos', async (req, res) => {
    try {
        const { nome, descricao, preco, disponivel } = req.body;

        if (!nome || !descricao || !preco) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nome, descrição e preço são obrigatórios' });
        }

        if (preco < 0) {
            return res.status(400).json({ sucesso: false, mensagem: 'O preço não pode ser negativo.' });
        }

        const novoProduto = {
            nome: nome.trim(),
            descricao: descricao.trim(),
            preco: preco,
            disponivel: disponivel !== undefined ? disponivel : true 
        };

        const resultado = await queryAsync('INSERT INTO produto SET ?', [novoProduto]);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Produto cadastrado com sucesso!',
            id: resultado.insertId
        });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: erro });
    }
});

app.put('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, disponivel } = req.body;
        const existe = await queryAsync('SELECT id FROM produto WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
        }

        const dadosAtualizados = {};
        if (nome !== undefined) dadosAtualizados.nome = nome.trim();
        if (descricao !== undefined) dadosAtualizados.descricao = descricao.trim();
        if (preco !== undefined) {
            if (preco < 0) return res.status(400).json({ sucesso: false, mensagem: 'Preço inválido.' });
            dadosAtualizados.preco = preco;
        }
        if (disponivel !== undefined) dadosAtualizados.disponivel = disponivel;

        await queryAsync('UPDATE produto SET ? WHERE id = ?', [dadosAtualizados, id]);

        res.json({ sucesso: true, mensagem: 'Produto atualizado com sucesso!' });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar produto' });
    }
});

app.delete('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await queryAsync('DELETE FROM produto WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
        }

        res.json({ sucesso: true, mensagem: 'Produto removido com sucesso!' });
    } catch (erro) {    '1'
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao remover produto' });
    }
});

module.exports = app;
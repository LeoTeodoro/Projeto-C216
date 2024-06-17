
const restify = require('restify');
const { Pool } = require('pg');

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres', // Usuário do banco de dados
    host: process.env.POSTGRES_HOST || 'db', // Este é o nome do serviço do banco de dados no Docker Compose
    database: process.env.POSTGRES_DB || 'cartas',
    password: process.env.POSTGRES_PASSWORD || 'password', // Senha do banco de dados
    port: process.env.POSTGRES_PORT || 5432,
  });


// iniciar o servidor
var server = restify.createServer({
    name: 'projeto-C216',
});

// Iniciando o banco de dados
async function initDatabase() {
    try {
        await pool.query('DROP TABLE IF EXISTS cartas');
        await pool.query('CREATE TABLE IF NOT EXISTS cartas (id SERIAL PRIMARY KEY, nome VARCHAR(255) NOT NULL, ataque VARCHAR(255) NOT NULL, defesa VARCHAR(255) NOT NULL, tipo VARCHAR(255) NOT NULL, descricao VARCHAR(255) NOT NULL)');
        console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao iniciar o banco de dados, tentando novamente em 5 segundos:', error);
        setTimeout(initDatabase, 5000);
    }
}

// Middleware para permitir o parsing do corpo da requisição
server.use(restify.plugins.bodyParser());

// Endpoint para inserir uma nova carta
server.post('/api/v1/carta/inserir', async (req, res, next) => {
    const { nome, ataque, defesa, tipo, descricao } = req.body;

    try {
        const result = await pool.query(
          'INSERT INTO cartas (nome, ataque, defesa, tipo, descricao) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [nome, ataque, defesa, tipo, descricao]
        );
        res.send(201, result.rows[0]);
        console.log('Carta inserida com sucesso:', result.rows[0]);
      } catch (error) {
        console.error('Erro ao inserir carta:', error);
        res.send(500, { message: 'Erro ao inserir carta' });
      }
    return next();
});

// Endpoint para listar todas as cartas
server.get('/api/v1/carta/listar', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM cartas');
        res.send(result.rows);
        console.log('cartas encontradas:', result.rows);
      } catch (error) {
        console.error('Erro ao listar cartas:', error);
        res.send(500, { message: 'Erro ao listar cartas' });
      }
    return next();
});

// Endpoint para atualizar uma carta existente
server.post('/api/v1/carta/atualizar', async (req, res, next) => {
    const {nome, ataque, defesa, tipo, descricao, id } = req.body;

    try {
        const result = await pool.query(
          'UPDATE cartas SET nome = $1, ataque = $2, defesa = $3, tipo = $4, descricao = $5 WHERE id = $6 RETURNING *',
          [nome, ataque, defesa, tipo, descricao, id]
        );
        if (result.rowCount === 0) {
          res.send(404, { message: 'Carta não encontrada' });
        } else {
          res.send(200, result.rows[0]);
          console.log('Carta atualizada com sucesso:', result.rows[0]);
        }
      } catch (error) {
        console.error('Erro ao atualizar carta:', error);
        res.send(500, { message: 'Erro ao atualizar carta' });
      }

    return next();
});

// Endpoint para excluir uma carta pelo ID
server.post('/api/v1/carta/excluir', async (req, res, next) => {
    const { id } = req.body;

    try {
        const result = await pool.query('DELETE FROM cartas WHERE id = $1', [id]);
        if (result.rowCount === 0) {
          res.send(404, { message: 'Carta não encontrada' });
        } else {
          res.send(200, { message: 'Carta excluída com sucesso' });
          console.log('Carta excluída com sucesso');
        }
      } catch (error) {
        console.error('Erro ao excluir carta:', error);
        res.send(500, { message: 'Erro ao excluir carta' });
      }

    return next();
});

// endpoint para resetar o banco de dados
server.del('/api/v1/database/reset', async (req, res, next) => {
    try {
      await pool.query('DROP TABLE IF EXISTS cartas');
      await pool.query('CREATE TABLE cartas (id SERIAL PRIMARY KEY, nome VARCHAR(255) NOT NULL, ataque VARCHAR(255) NOT NULL, defesa VARCHAR(255) NOT NULL, tipo VARCHAR(255) NOT NULL, descricao VARCHAR(255) NOT NULL');
      res.send(200, { message: 'Banco de dados resetado com sucesso' });
      console.log('Banco de dados resetado com sucesso');
    } catch (error) {
      console.error('Erro ao resetar o banco de dados:', error);
      res.send(500, { message: 'Erro ao resetar o banco de dados' });
    }
  
    return next();
});

// iniciar o servidor
var port = process.env.PORT || 5000;
server.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Content-Length, X-Requested-With'
    );
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});
server.listen(port, function() {
    console.log('Servidor iniciado', server.name, ' na url http://localhost:' + port);
    // Iniciando o banco de dados
    console.log('Iniciando o banco de dados');
    initDatabase();
});



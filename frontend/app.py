from flask import Flask, render_template, request, redirect, url_for, jsonify
import requests
import os

app = Flask(__name__)

# Definindo as variáveis de ambiente
API_BASE_URL = os.getenv("API_BASE_URL" , "http://localhost:5000/api/v1/carta")
API_DATABASE_RESET = os.getenv("API_DATABASE_RESET" , "http://localhost:5000/api/v1/database/reset") 

# Rota para a página inicial
@app.route('/')
def index():
    return render_template('index.html')

# Rota para exibir o formulário de cadastro
@app.route('/inserir', methods=['GET'])
def inserir_carta_form():
    return render_template('inserir.html')

# Rota para enviar os dados do formulário de cadastro para a API
@app.route('/inserir', methods=['POST'])
def inserir_carta():
    nome = request.form['nome']
    ataque = request.form['ataque']
    defesa = request.form['defesa']
    tipo = request.form['tipo']
    descricao = request.form['descricao']

    payload = {
        'nome': nome,
        'ataque': ataque,
        'defesa': defesa,
        'tipo': tipo,
        'descricao': descricao
    }

    response = requests.post(f'{API_BASE_URL}/inserir', json=payload)
    
    if response.status_code == 201:
        return redirect(url_for('listar_cartas'))
    else:
        return "Erro ao inserir cartas", 500

# Rota para listar todos os cartas
@app.route('/listar', methods=['GET'])
def listar_cartas():
    response = requests.get(f'{API_BASE_URL}/listar')
    cartas = response.json()
    return render_template('listar.html', cartas=cartas)

# Rota para exibir o formulário de edição de carta
@app.route('/atualizar/<int:carta_id>', methods=['GET'])
def atualizar_carta_form(carta_id):
    response = requests.get(f"{API_BASE_URL}/listar")
    #filtrando apenas o carta correspondente ao ID
    cartas = [carta for carta in response.json() if carta['id'] == carta_id]
    if len(cartas) == 0:
        return "Carta não encontrada", 404
    carta = cartas[0]
    return render_template('atualizar.html', carta=carta)

# Rota para enviar os dados do formulário de edição de carta para a API
@app.route('/atualizar/<int:carta_id>', methods=['POST'])
def atualizar_carta(carta_id):
    nome = request.form['nome']
    ataque = request.form['ataque']
    defesa = request.form['defesa']
    tipo = request.form['tipo']
    descricao = request.form['descricao']

    payload = {
        'id': carta_id,
        'nome': nome,
        'ataque': ataque,
        'defesa': defesa,
        'tipo': tipo,
        'descricao': descricao
    }

    response = requests.post(f"{API_BASE_URL}/atualizar", json=payload)
    
    if response.status_code == 200:
        return redirect(url_for('listar_cartas'))
    else:
        return "Erro ao atualizar carta", 500

# Rota para excluir uma carta
@app.route('/excluir/<int:carta_id>', methods=['POST'])
def excluir_carta(carta_id):
    #payload = {'id': carta_id}
    payload = {'id': carta_id}

    response = requests.post(f"{API_BASE_URL}/excluir", json=payload)
    
    if response.status_code == 200  :
        return redirect(url_for('listar_cartas'))
    else:
        return "Erro ao excluir carta", 500

#Rota para resetar o database
@app.route('/reset-database', methods=['GET'])
def resetar_database():
    response = requests.delete(API_DATABASE_RESET)
    
    if response.status_code == 200  :
        return redirect(url_for('index'))
    else:
        return "Erro ao resetar o database", 500


if __name__ == '__main__':
    app.run(debug=True, port=3000, host='0.0.0.0')

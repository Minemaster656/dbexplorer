from flask import Flask, render_template, request, Response
from sqlite3 import connect
from json import dumps, loads
import sys
import os

app = Flask(__name__)


@app.get("/")
def root():
    return render_template('index.html')


@app.get("/api/tables")
def tables():
    db = request.headers.get("db")
    if not db:
        return Response('{"error":"Укажите базу данных!"}', status=400)
    if not os.path.exists(db):
        return Response('{"error":"База данных не найдена"}', status=404)
    try:
        conn = connect(db)
        curs = conn.cursor()
        curs.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in curs.fetchall()]
        conn.close()
        return Response(dumps({"tables": tables}), status=200)
    except Exception as e:
        try:
            conn.close()
        except:
            pass
        return Response(dumps({"error": str(e)}), status=500)

@app.get("/api/databases")
def databases():
    return Response(dumps(["db/" + x for x in os.listdir("db")], ensure_ascii=False), status=200)
    
if __name__ == '__main__':
    app.run(port=8000, host="0.0.0.0", debug=True)

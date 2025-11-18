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


@app.get("/api/tables/sample")
def sample_table():
    db = request.headers.get("db")
    if not db:
        return Response('{"error":"Укажите базу данных!"}', status=400)
    if not os.path.exists(db):
        return Response('{"error":"База данных не найдена"}', status=404)
    conn = None
    try:
        table = request.headers.get("table")
        if not table:
            return Response('{"error":"Укажите таблицу!"}', status=400)
        conn = connect(db)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cur.fetchall()]
        if table not in tables:
            return Response('{"error":"Таблица в базе данных не найдена"}', status=404)
        cur.execute(f"SELECT * FROM {table} LIMIT 256")
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        # column_types = [desc[1] for desc in cur.description]
        # print(cur.description)
        data = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                if isinstance(value, bytes):
                    row_dict[columns[i]] = value.decode(
                        'utf-8', errors='replace')
                else:
                    row_dict[columns[i]] = value
            data.append(row_dict)

        # column_info = {columns[i]: column_types[i] for i in range(len(columns))}
        return Response(dumps({"columns": columns, "data": data}), status=200)
    except Exception as e:
        if conn:
            conn.close()
        return Response(dumps({"error": str(e)}), status=500)


if __name__ == '__main__':
    app.run(port=8000, host="0.0.0.0", debug=True)

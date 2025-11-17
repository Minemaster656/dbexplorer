from flask import Flask, render_template, request, Response
from sqlite3 import connect
from json import dumps, loads

app = Flask(__name__)


@app.get("/")
def root():
    return render_template('index.html')


@app.get("/tables")
def tables():
    db = request.headers.get("db")
    if not db:
        return Response(status=400)
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


if __name__ == '__main__':
    app.run(port=8000, host="0.0.0.0", debug=True)

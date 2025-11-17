from flask import Flask, render_template, request

app = Flask(__name__)

@app.get("/")
def root():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(port=8000, host="0.0.0.0", debug=True)
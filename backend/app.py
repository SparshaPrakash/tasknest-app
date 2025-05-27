from flask import Flask, jsonify, request, abort
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # ✅ import CORS only
from datetime import datetime
from models import db, Task

app = Flask(__name__)

# ✅ Correct CORS configuration
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# ✅ SQLite config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

@app.route('/')
def home():
    return {'message': 'TaskNest backend is working!'}

@app.route('/tasks', methods=['GET', 'POST'])
def tasks():
    if request.method == 'GET':
        tasks = Task.query.all()
        return jsonify([task.to_dict() for task in tasks])

    if request.method == 'POST':
        data = request.get_json()
        reminder = data.get('reminder_time')
        new_task = Task(
            title=data['title'],
            completed=data.get('completed', False),
            reminder_time=datetime.fromisoformat(reminder) if reminder else None,
            priority=data.get('priority', 'Medium')
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return abort(404, description="Task not found")

    data = request.get_json()
    task.completed = data.get('completed', task.completed)
    task.priority = data.get('priority', task.priority)

    reminder = data.get('reminder_time')
    if reminder is not None:
        task.reminder_time = datetime.fromisoformat(reminder) if reminder else None

    db.session.commit()
    return jsonify(task.to_dict())

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return abort(404, description="Task not found")

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200

@app.route('/test')
def test_cors():
    return jsonify({"message": "CORS is working!"})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

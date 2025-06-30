from flask import Blueprint, request, jsonify, abort
from datetime import datetime
from models import Task, db
from flask_jwt_extended import jwt_required, get_jwt_identity

main = Blueprint('main', __name__)

@main.route('/tasks', methods=['GET', 'POST'])
@jwt_required()
def tasks():
    user_id = get_jwt_identity()

    if request.method == 'GET':
        tasks = Task.query.filter_by(user_id=user_id).all()
        return jsonify([task.to_dict() for task in tasks])

    if request.method == 'POST':
        data = request.get_json()
        reminder = data.get('reminder_time')
        new_task = Task(
            title=data['title'],
            completed=data.get('completed', False),
            reminder_time=datetime.fromisoformat(reminder) if reminder else None,
            priority=data.get('priority', 'Medium'),
            user_id=user_id  # ✅ link task to user
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201


@main.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()

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


@main.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return abort(404, description="Task not found")

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200


@main.route('/test')
def test_cors():
    return jsonify({"message": "CORS is working!"})

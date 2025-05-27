from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    reminder_time = db.Column(db.DateTime, nullable=True)
    priority = db.Column(db.String(20), default='Medium') 

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'completed': self.completed,
            'reminder_time': self.reminder_time.isoformat() if self.reminder_time else None,
            'priority': self.priority
        }

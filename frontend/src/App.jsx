import { useState, useEffect } from 'react';
import axios from 'axios';
import { startOfWeek, addDays, format, isSameDay, parseISO } from 'date-fns';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [noteInput, setNoteInput] = useState('');
  const [savedNotes, setSavedNotes] = useState(() => {
    const notes = localStorage.getItem('taskNotesList');
    return notes ? JSON.parse(notes) : [];
  });
  const [selectedNote, setSelectedNote] = useState(null);
  const [editTaskId, setEditTaskId] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);

  const [journalEntry, setJournalEntry] = useState('');
  const [savedJournal, setSavedJournal] = useState(() => {
    return localStorage.getItem('journalEntry') || '';
  });

  const handleSaveJournal = () => {
    if (journalEntry.trim()) {
      setSavedJournal(journalEntry);
      localStorage.setItem('journalEntry', journalEntry);
      setJournalEntry('');
    }
  };

  useEffect(() => {
    axios.get('http://localhost:5000/tasks')
      .then(res => setTasks(res.data))
      .catch(err => console.error('Error fetching tasks:', err));
  }, []);

  useEffect(() => {
    let timer;
    if (isRunning && pomodoroTime > 0) {
      timer = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsRunning(false);
      alert("Pomodoro finished! Take a break.");
    }
    return () => clearInterval(timer);
  }, [isRunning, pomodoroTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const taskData = {
      title: newTaskTitle,
      reminder_time: reminderTime || null,
      priority
    };

    if (editTaskId) {
      axios.put(`http://localhost:5000/tasks/${editTaskId}`, taskData)
        .then(res => {
          setTasks(tasks.map(t => t.id === editTaskId ? res.data : t));
          setEditTaskId(null);
          setNewTaskTitle('');
          setReminderTime('');
          setPriority('Medium');
        }).catch(err => console.error('Error updating task:', err));
    } else {
      axios.post('http://localhost:5000/tasks', taskData)
        .then(res => {
          setTasks([...tasks, res.data]);
          setNewTaskTitle('');
          setReminderTime('');
          setPriority('Medium');
        }).catch(err => console.error('Error adding task:', err));
    }
  };

  const handleEditTask = (task) => {
    setEditTaskId(task.id);
    setNewTaskTitle(task.title);
    setReminderTime(task.reminder_time ? task.reminder_time.slice(0, 16) : '');
    setPriority(task.priority || 'Medium');
  };

  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    const updatedNotes = [...savedNotes, noteInput];
    setSavedNotes(updatedNotes);
    localStorage.setItem('taskNotesList', JSON.stringify(updatedNotes));
    setNoteInput('');
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = savedNotes.filter((_, i) => i !== index);
    setSavedNotes(updatedNotes);
    localStorage.setItem('taskNotesList', JSON.stringify(updatedNotes));
    if (selectedNote === savedNotes[index]) setSelectedNote(null);
  };

  const handleEditNote = (index) => {
    setNoteInput(savedNotes[index]);
    handleDeleteNote(index);
  };

  const getTasksForWeek = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dayTasks = tasks.filter(task =>
        task.reminder_time &&
        isSameDay(parseISO(task.reminder_time), date)
      );
      days.push({ date, tasks: dayTasks });
    }
    return days;
  };

  return (
    <div style={{ display: 'flex', padding: '2rem', fontFamily: 'sans-serif', gap: '2rem' }}>
      <div style={{ flex: 2 }}> {/* Left side */}
        <h1>📝 TaskNest</h1>
        <form onSubmit={handleAddTask}>
          <input type="text" placeholder="Enter new task..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} style={{ padding: '0.5rem', fontSize: '1rem', width: '300px' }} />
          <input type="datetime-local" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} style={{ padding: '0.5rem', fontSize: '1rem', marginTop: '0.5rem', display: 'block' }} />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ marginTop: '0.5rem', padding: '0.5rem', fontSize: '1rem' }}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button type="submit" style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>{editTaskId ? 'Update' : 'Add'}</button>
        </form>

        <ul style={{ marginTop: '2rem', padding: 0 }}>
          {tasks.map(task => (
            <li key={task.id} style={{ listStyle: 'none', marginBottom: '1rem', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" checked={task.completed} onChange={() => {
                  axios.put(`http://localhost:5000/tasks/${task.id}`, { completed: !task.completed })
                    .then(res => {
                      const updated = tasks.map(t => t.id === task.id ? res.data : t);
                      setTasks(updated);
                    })
                    .catch(err => console.error('Error updating task:', err));
                }} />
                <span style={{ marginLeft: '0.5rem', textDecoration: task.completed ? 'line-through' : 'none', flexGrow: 1 }}>{task.title} <small style={{ marginLeft: '0.5rem', color: '#888' }}>({task.priority || 'Medium'})</small></span>
                <button onClick={() => handleEditTask(task)} style={{ marginLeft: '0.5rem', padding: '0.3rem 0.7rem', backgroundColor: '#f1c40f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => {
                  axios.delete(`http://localhost:5000/tasks/${task.id}`)
                    .then(() => setTasks(tasks.filter(t => t.id !== task.id)))
                    .catch(err => console.error('Error deleting task:', err));
                }} style={{ marginLeft: '0.5rem', padding: '0.3rem 0.7rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </div>
              {task.reminder_time && (
                <small style={{ marginTop: '0.4rem', marginLeft: '1.5rem', display: 'block', color: '#555' }}>
                  🔔 Reminder: {new Date(task.reminder_time).toLocaleString()}
                </small>
              )}
            </li>
          ))}
        </ul>

        <h2 style={{ marginTop: '3rem' }}>🗓️ Weekly Calendar</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          {getTasksForWeek().map(({ date, tasks }) => (
            <div key={date} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
              <strong>{format(date, 'EEE dd')}</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                {tasks.length > 0 ? tasks.map(task => (
                  <li key={task.id}>📝 {task.title} ({task.priority || 'Medium'})</li>
                )) : <li style={{ color: '#aaa' }}>No tasks</li>}
              </ul>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: '3rem' }}>⏳ Pomodoro Timer</h2>
        <div style={{ marginTop: '1rem', fontSize: '2rem' }}>{formatTime(pomodoroTime)}</div>
        <button onClick={() => setIsRunning(!isRunning)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: isRunning ? '#e67e22' : '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isRunning ? 'Pause' : 'Start'} Pomodoro
        </button>

        <div style={{ marginTop: '3rem' }}>
          <h2>📓 Journal</h2>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Write your private thoughts..."
            style={{ width: '100%', height: '150px', padding: '0.5rem', fontSize: '1rem' }}
          />
          <button
            onClick={handleSaveJournal}
            style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Save Journal
          </button>
          {savedJournal && (
            <div style={{ marginTop: '1rem', background: '#f4f4f4', padding: '1rem', borderRadius: '6px' }}>
              <h4>Your Last Saved Entry:</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{savedJournal}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', height: 'auto' }}> {/* Right side */}
        <h2>🗒️ Notes</h2>
        <textarea
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder="Write your thoughts here..."
          style={{ width: '100%', height: '100px', padding: '0.5rem', fontSize: '1rem' }}
        />
        <button
          onClick={handleSaveNote}
          style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Save Note
        </button>

        <ul style={{ marginTop: '1rem', paddingLeft: '0', listStyle: 'none' }}>
          {savedNotes.map((note, index) => (
            <li
              key={index}
              style={{
                position: 'relative',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                color: '#333',
                background: '#fff',
                padding: '0.5rem',
                borderRadius: '4px'
              }}
              onClick={() => setSelectedNote(note)}
            >
              {note.length > 30 ? note.slice(0, 30) + '...' : note}
              <div style={{ position: 'absolute', right: '8px', top: '4px' }}>
                <button onClick={(e) => { e.stopPropagation(); handleEditNote(index); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', marginRight: '0.2rem' }}>🖊️</button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(index); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
              </div>
            </li>
          ))}
        </ul>

        {selectedNote && (
          <div style={{ marginTop: '1rem', background: '#fff', padding: '0.75rem', borderRadius: '6px', color: '#222', whiteSpace: 'pre-wrap' }}>
            <p>{selectedNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
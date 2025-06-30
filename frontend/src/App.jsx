// App.jsx (Full TaskNest with original UI and features + JWT login)
import { useState, useEffect } from 'react';
import axios from 'axios';
import { startOfWeek, addDays, format, isSameDay, parseISO, isAfter, isBefore, addMonths} from 'date-fns';

function App() {
  const [activeSection, setActiveSection] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [noteInput, setNoteInput] = useState('');
  const [savedNotes, setSavedNotes] = useState(() => JSON.parse(localStorage.getItem('taskNotesList')) || []);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editTaskId, setEditTaskId] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [savedJournal, setSavedJournal] = useState(() => localStorage.getItem('journalEntry') || '');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [filter, setFilter] = useState('all');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      localStorage.setItem('darkMode', !prev);
      return !prev;
    });
  };

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#121212' : '#ffffff';
    document.body.style.color = isDarkMode ? '#f0f0f0' : '#000000';
  }, [isDarkMode]);

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5000/tasks', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setTasks(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setToken('');
        });
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', { username, password });
      const accessToken = res.data.access_token;
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUsername('');
    setPassword('');
  };

  

  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    const updatedNotes = [...savedNotes, noteInput];
    setSavedNotes(updatedNotes);
    localStorage.setItem('taskNotesList', JSON.stringify(updatedNotes));
    setNoteInput('');
  };

const handleAddOrUpdateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const taskData = {
      title: newTaskTitle,
      reminder_time: reminderTime || null,
      priority
    };

    if (editTaskId) {
      axios.put(`http://localhost:5000/tasks/${editTaskId}`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setTasks(tasks.map(t => t.id === editTaskId ? res.data : t));
          resetForm();
        })
        .catch(err => console.error('Error updating task:', err));
    } else {
      axios.post('http://localhost:5000/tasks', taskData, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setTasks([...tasks, res.data]);
          resetForm();
        })
        .catch(err => console.error('Error adding task:', err));
    }
  };


  const resetForm = () => {
    setEditTaskId(null);
    setNewTaskTitle('');
    setReminderTime('');
    setPriority('Medium');
    setFilter('all');
  };

  const handleEditTask = (task) => {
    setEditTaskId(task.id);
    setNewTaskTitle(task.title);
    setReminderTime(task.reminder_time ? task.reminder_time.slice(0, 16) : '');
    setPriority(task.priority || 'Medium');
  };

  const handleDeleteTask = (id) => {
    axios.delete(`http://localhost:5000/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setTasks(tasks.filter(task => task.id !== id)))
      .catch(err => console.error('Error deleting task:', err));
  };

 const toggleTaskCompletion = (task) => {
    const updatedTask = {
      title: task.title,
      completed: !task.completed,
      priority: task.priority,
      reminder_time: task.reminder_time
    };
    axios.put(`http://localhost:5000/tasks/${task.id}`, updatedTask, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setTasks(tasks.map(t => t.id === task.id ? res.data : t)))
      .catch(err => console.error('Error toggling completion:', err));
  };

  const filteredTasks = tasks.filter(task => {
    const now = new Date();
    const taskDate = task.reminder_time ? parseISO(task.reminder_time) : null;
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    if (filter === 'high') return task.priority === 'High';
    if (filter === 'medium') return task.priority === 'Medium';
    if (filter === 'low') return task.priority === 'Low';
    if (filter === 'today') return taskDate && isSameDay(taskDate, now);
    if (filter === 'week') return taskDate && isAfter(taskDate, now) && isBefore(taskDate, addDays(now, 7));
    if (filter === 'month') return taskDate && isAfter(taskDate, now) && isBefore(taskDate, addMonths(now, 1));
    return true;
  });

    const renderSection = () => {
    switch (activeSection) {
      case 'tasks':
        return (
          <div>
            <h2>✅ Tasks</h2>
            <form onSubmit={handleAddOrUpdateTask}>
              <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Task Title" />
              <input type="datetime-local" value={reminderTime} onChange={e => setReminderTime(e.target.value)} />
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button type="submit">{editTaskId ? 'Update' : 'Add'} Task</button>
            </form>

            <div style={{ margin: '1rem 0' }}>
              <label>Filter:</label>
              <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="incomplete">Incomplete</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="today">Today</option>
                <option value="week">Next 7 Days</option>
                <option value="month">Next 1 Month</option>
              </select>
            </div>

            <ul>
              {filteredTasks.map(task => (
                <li key={task.id} style={{ marginBottom: '1rem', background: '#eee', padding: '1rem', borderRadius: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label>
                      <input type="checkbox" checked={task.completed} onChange={() => toggleTaskCompletion(task)} />
                      <span style={{ marginLeft: '0.5rem', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</span>
                    </label>
                    <div>
                      <button onClick={() => handleEditTask(task)}>✏️</button>
                      <button onClick={() => handleDeleteTask(task.id)} style={{ marginLeft: '0.5rem', color: 'red' }}>🗑️</button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#444', marginTop: '0.5rem' }}>
                    Priority: {task.priority} | Reminder: {task.reminder_time ? format(parseISO(task.reminder_time), 'PPpp') : 'None'}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'notes':
        return (
          <div>
            <h2>🗒️ Notes</h2>
            <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} />
            <button onClick={handleSaveNote}>Save Note</button>
            <ul>
              {savedNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        );
      case 'calendar':
        return (
          <div>
            <h2>📅 Weekly Calendar</h2>
            {getTasksForWeek().map(({ date, tasks }) => (
              <div key={date}>
                <strong>{format(date, 'EEE dd')}</strong>
                <ul>
                  {tasks.length > 0 ? tasks.map(task => <li key={task.id}>{task.title}</li>) : <li>No tasks scheduled</li>}
                </ul>
              </div>
            ))}
          </div>
        );
      case 'pomodoro':
        return (
          <div>
            <h2>⏳ Pomodoro</h2>
            <p>Pomodoro timer UI here</p>
          </div>
        );
      default:
        return (
          <div>
            <h1>👋 Welcome to TaskNest!</h1>
            <p>Select a section to get started.</p>
          </div>
        );
    }
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h2>🔐 Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', display: 'flex', gap: '1rem', zIndex: 999 }}>
        <button onClick={toggleDarkMode}>{isDarkMode ? '☀️' : '🌙'}</button>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>
      <div style={{ display: 'flex', fontFamily: 'sans-serif', backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff', color: isDarkMode ? '#f0f0f0' : '#000000', minHeight: '100vh' }}>
        <div style={{ width: '150px', backgroundColor: isDarkMode ? '#2c2c2c' : '#f5f5f5', padding: '1.5rem 1rem 1rem 1rem', borderRight: '1px solid #ccc' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'cursive', fontSize: '1.4rem', margin: 0 }}>📝 TaskNest</h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', transform: 'translateY(-30px)' }}>
            <li style={{ textAlign: 'center', padding: '0.75rem 0', borderBottom: '1px solid #999' }}><a href="#home" onClick={(e) => { e.preventDefault(); setActiveSection(''); }}>🏠 Home</a></li>
            <li style={{ textAlign: 'center', padding: '0.75rem 0', borderBottom: '1px solid #999' }}><a href="#tasks" onClick={(e) => { e.preventDefault(); setActiveSection('tasks'); }}>✅ Tasks</a></li>
            <li style={{ textAlign: 'center', padding: '0.75rem 0', borderBottom: '1px solid #999' }}><a href="#notes" onClick={(e) => { e.preventDefault(); setActiveSection('notes'); }}>🗒️ Notes</a></li>
            <li style={{ textAlign: 'center', padding: '0.75rem 0', borderBottom: '1px solid #999' }}><a href="#calendar" onClick={(e) => { e.preventDefault(); setActiveSection('calendar'); }}>📅 Calendar</a></li>
            <li style={{ textAlign: 'center', padding: '0.75rem 0' }}><a href="#pomodoro" onClick={(e) => { e.preventDefault(); setActiveSection('pomodoro'); }}>⏳ Pomodoro</a></li>
          </ul>
        </div>
        <div style={{ flex: 1, padding: '2rem' }}>{renderSection()}</div>
      </div>
    </>
  );
}

export default App;

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
  // const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  // const [isRunning, setIsRunning] = useState(false);
  // const [journalEntry, setJournalEntry] = useState('');
  // const [savedJournal, setSavedJournal] = useState(() => localStorage.getItem('journalEntry') || '');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [filter, setFilter] = useState('all');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [journalInput, setJournalInput] = useState('');
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [journalEntries, setJournalEntries] = useState(() => JSON.parse(localStorage.getItem('journalEntries') || '[]'));

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
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/tasks`, {headers: { Authorization: `Bearer ${token}` }})

        .then(res => setTasks(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setToken('');
        });
    }
  }, [token]);

  useEffect(() => {
    let timer;
    if (isPomodoroRunning && pomodoroSeconds > 0) {
      timer = setTimeout(() => setPomodoroSeconds(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isPomodoroRunning, pomodoroSeconds]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, { username, password });
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
    const updatedNotes = editingNoteIndex !== null
      ? savedNotes.map((note, idx) => idx === editingNoteIndex ? noteInput : note)
      : [...savedNotes, noteInput];

    setSavedNotes(updatedNotes);
    localStorage.setItem('taskNotesList', JSON.stringify(updatedNotes));
    setNoteInput('');
    setEditingNoteIndex(null);
  };

  const handleEditNote = (index) => {
    setNoteInput(savedNotes[index]);
    setEditingNoteIndex(index);
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = savedNotes.filter((_, i) => i !== index);
    setSavedNotes(updatedNotes);
    localStorage.setItem('taskNotesList', JSON.stringify(updatedNotes));
  };

const handleDeleteJournalEntry = (index) => {
    const updated = journalEntries.filter((_, i) => i !== index);
    setJournalEntries(updated);
    localStorage.setItem('journalEntries', JSON.stringify(updated));
  };

  const handleEditJournalEntry = (index) => {
    setJournalInput(journalEntries[index]);
    handleDeleteJournalEntry(index);
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
      axios.put(`${import.meta.env.VITE_API_BASE_URL}/tasks/${editTaskId}`, taskData, {
  headers: { Authorization: `Bearer ${token}` }
})
        .then(res => {
          setTasks(tasks.map(t => t.id === editTaskId ? res.data : t));
          resetForm();
        })
        .catch(err => console.error('Error updating task:', err));
    } else {
      axios.post(`${import.meta.env.VITE_API_BASE_URL}/tasks`, taskData, {
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
  axios.delete(`${import.meta.env.VITE_API_BASE_URL}/tasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
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
    axios.put(`${import.meta.env.VITE_API_BASE_URL}/tasks/${task.id}`, updatedTask, {
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

  const getTasksForWeek = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      const dayTasks = tasks.filter(task => task.reminder_time && isSameDay(parseISO(task.reminder_time), date));
      return { date, tasks: dayTasks };
    });
  };

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
            <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Write a note..." />
            <button onClick={handleSaveNote}>{editingNoteIndex !== null ? 'Update Note' : 'Save Note'}</button>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {savedNotes.map((note, index) => (
               <li key={index} style={{ padding: '0.5rem 0', borderBottom: '1px solid #999', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{note}</span>
                  <div>
                    <button onClick={() => handleEditNote(index)} style={{ fontSize: '0.5rem', marginRight: '0.5rem' }}>✏️</button>
                    <button onClick={() => handleDeleteNote(index)} style={{ fontSize: '0.5rem', color: 'red' }}>🗑️</button>
                 </div>
             </li>
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
            <h2>⏳ Pomodoro Timer</h2>
            <p>{Math.floor(pomodoroSeconds / 60)}:{('0' + pomodoroSeconds % 60).slice(-2)}</p>
            <button onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}>
              {isPomodoroRunning ? 'Pause' : 'Start'}
            </button>
            {pomodoroSeconds === 0 && <p>🎉 Great job! Take a 5 min break.</p>}
          </div>
        );
      case 'journal':
        return (
          <div>
            <h2>📖 Journal</h2>
            <p><em>“Your mind is a garden. Your thoughts are the seeds.”</em></p>
            <textarea value={journalInput} onChange={e => setJournalInput(e.target.value)} placeholder="Write your thoughts..." />
            <button onClick={() => {
              const updated = [...journalEntries, journalInput];
              setJournalEntries(updated);
              localStorage.setItem('journalEntries', JSON.stringify(updated));
              setJournalInput('');
            }}>Save Entry</button>
            <ul style={{ listStyle: 'none', padding: 0 }}>
             {journalEntries.map((entry, idx) => (
               <li key={idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid #999', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{entry}</span>
                <div>
                  <button onClick={() => handleEditJournalEntry(idx)} style={{ fontSize: '0.5rem', marginRight: '0.5rem' }}>✏️</button>
                  <button onClick={() => handleDeleteJournalEntry(idx)} style={{ fontSize: '0.5rem', color: 'red' }}>🗑️</button>
                </div>
              </li>
            ))}
          </ul>
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
            <li style={{ textAlign: 'center', padding: '0.75rem 0', borderBottom: '1px solid #999' }}><a href="#pomodoro" onClick={(e) => { e.preventDefault(); setActiveSection('pomodoro'); }}>⏳ Pomodoro</a></li>
            <li style={{ textAlign: 'center', padding: '0.75rem 0' }}><a href="#journal" onClick={(e) => { e.preventDefault(); setActiveSection('journal'); }}>📖 My Journal</a></li>
          </ul>
        </div>
        <div style={{ flex: 1, padding: '2rem' }}>{renderSection()}</div>
      </div>
    </>
  );
}

export default App;

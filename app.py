from flask import Flask, render_template, request, url_for, flash, redirect, session, jsonify, current_app
from flask_session import Session
from functools import wraps
from midi import MidiConnector, NoteOn, Message
import threading
from queue import SimpleQueue
from midi_worker import MidiWorker, midi_worker_function
import os
import glob

try:
	import mido
except Exception  as e:
	print(e)
	HAS_MIDO = False
else:
	HAS_MIDO = True

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = '12342sdfkm2##@&^sa12'
app.config['WIDGETS_DIR'] = r'templates\widgets'
app.config['SETUPS_DIR'] = r'templates\setups'
midi_queue = SimpleQueue()
response_queue = SimpleQueue()
worker_status_queue = SimpleQueue()

KEEPALIVE = ('note_on', {'note':30})

##DECORATORS
def active_midi_required(response_redirect=True):
	def decorator(f):
		@wraps(f)
		def decorated_function(*args, **kwargs):
			if session.get('MIDI_CONN') == None:
				if response_redirect:
					flash('Could Not Find Active Midi Connection', 'danger')
					return redirect(url_for('controller'))
				else:
					return 'Could Not Find Active Midi Connection', 503

			return f(*args, **kwargs)
		return decorated_function
	return decorator

def closed_midi_required(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		if session.get('MIDI_CONN') != None:
			flash('Could Not Handle Request While Active Midi Connection Found', 'danger')
			return redirect(url_for('controller'))

		return f(*args, **kwargs)
	return decorated_function

def sync_session_with_threads(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		active_workers = 0
		threads = threading.enumerate()
		for thread in threads:
			if thread.name.startswith('Midi Worker'):
				active_workers += 1
		print(f'active workers: {active_workers}')
		if active_workers == 0: ## when no workets, make sure session cleared
			if session.get('MIDI_CONN') == True:
				session['MIDI_CONN'] = None
				print('synced session')

		elif session.get('MIDI_CONN') == None: ## when the are workers but no session, kill workers
			for i in range(0, active_workers):
				midi_queue.put(None)
				print(f'killed unsynced worker #{i+1}')

		return f(*args, **kwargs)
	return decorated_function

##MAIN ROUTES
@app.route('/')
@app.route('/controller')
@sync_session_with_threads
def controller():
	if not HAS_MIDO:
		flash('Server Does Not Support Direct LoopMidi Input, Only COM-PORTS (Error: Could not import mido)', 'warning')
	return render_template('controller.html')


##MIDI COMMANDS
@app.route('/open_midi', methods=['POST'])
@closed_midi_required
def open_midi():
	
	port = request.form.get('port_select')
	baudrate = request.form.get('baudrate')

	worker = threading.Thread(name=f'Midi Worker {port} {baudrate}', target=midi_worker_function, args=(midi_queue, worker_status_queue, response_queue ,port, baudrate), daemon=True)
	worker.start()
	worker_alive = worker_status_queue.get()
	if worker_alive:
		session['MIDI_CONN'] = True
		flash('Successfully Opened Midi Connection', 'success')

	else:
		session['MIDI_CONN'] = None
		flash('Could Not Open Midi Connection', 'danger')
	
	return redirect(url_for('controller'))

@app.route('/close_midi')
@active_midi_required()
def close_midi():
	midi_queue.put(None)
	session['MIDI_CONN'] = None
	flash('Closed Midi Connection', 'success')
	return redirect(url_for('controller'))

@app.route('/midi', methods=['POST'])
@app.route('/midi/<string:command>', methods=['POST'])
@active_midi_required(response_redirect=False)
def midi_command(command=None):
	if command:
		data = request.get_json(force=True)
	else:
		##KEEPALIVE COMMAND
		command,data = KEEPALIVE
		#return jsonify(True), 200
		
	midi_queue.put((command, data))
	
	worker_success = False
	try: 
		worker_success = response_queue.get(timeout=1)
	except Exception as e:
		print(e)

	if not worker_success:
		session['MIDI_CONN'] = None
	return jsonify(worker_success), (200 if worker_success else 503)

##UI API
@app.route('/ports')
def get_ports():
	if HAS_MIDO:
		ports = mido.get_output_names()
	else:
		ports = []
	return jsonify(ports)

@app.route('/widgets')
def get_widgets():
	widgets_dir = os.path.join(current_app.root_path, app.config['WIDGETS_DIR'])
	widget_files = glob.glob(widgets_dir + r'\*.html')
	widget_names = [os.path.basename(path).split('.')[0] for path in widget_files]
	return jsonify(widget_names)

@app.route('/widget', methods=[])
@app.route('/widget/<string:widget_type>', methods=['POST'])
def get_widget(widget_type):
	widget_id = request.form['id']
	return render_template(f'widgets/{widget_type}.html', widget_id=widget_id)

@app.route('/setups')
def get_setups():
	setups_dir = os.path.join(current_app.root_path, app.config['SETUPS_DIR'])
	setups_files = glob.glob(setups_dir + r'\*.html')
	setups_names = [os.path.basename(path).split('.')[0] for path in setups_files]
	return jsonify(setups_names)

@app.route('/setup')
@app.route('/setup/<string:setup_name>', methods=['POST', 'GET'])
def setup(setup_name):
	if request.method == 'GET':
		return render_template(f'setups/{setup_name}.html')
	else: ##'POST'
		setup = request.values['content']
		setups_dir = os.path.join(current_app.root_path, app.config['SETUPS_DIR'])
		setup_path = os.path.join(setups_dir, f'{setup_name}.html')
		with open(setup_path, 'w') as f:
			f.write(setup)
		return f'Setup {setup_name} saved'


##MAIN
def main():
	Session().init_app(app)
	app.run(port='80', host='0.0.0.0', debug=True)

if __name__ == '__main__':
	main()

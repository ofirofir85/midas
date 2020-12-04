import midi
try:
	import mido
except Exception as e:
	pass


import threading

class MidiWorker(object):
	def __init__(self, port, baudrate=None):
		if baudrate:
			self.type = 'SERIAL'
			self.conn = midi.MidiConnector(port=port, baudrate=baudrate)
		else:
			self.type = 'VIRTUAL'
			self.conn = mido.open_output(port)

	def is_open(self):
		if self.type == 'SERIAL':
			return self.conn._MidiConnector__connector.is_open
 
		return not self.conn.closed

	def close(self):
		self.conn.close()

	def __str__(self):
		return str(self.conn)

	def send(self, command, kwargs):
		for key in kwargs:
			kwargs[key] = int(kwargs[key])

		if self.type == 'SERIAL':
			channel = kwargs['channel'] + 1
			if command == 'note_on':
				note = kwargs['note']
				velocity = kwargs['velocity']
				msg_type = midi.NoteOn(note, velocity)
			elif command == 'control_change':
				control = kwargs['control']
				value = kwargs['value']
		
			msg = midi.Message(msg_type, channel=channel)
			self.conn.write(msg)
		else:
			msg = mido.Message(command, **kwargs)
			self.conn.send(msg)

def midi_worker_function(midi_queue, worker_status_queue, response_queue, port, baudrate=None):
	while midi_queue.empty() != True:
		midi_queue.get()

	try:
		worker = MidiWorker(port, baudrate)
	except Exception as e:
		print(e)
		worker_status_queue.put(False)
		return
	
	worker_status_queue.put(True)
	print(worker)

	while worker.is_open():
		msg = midi_queue.get()
		if msg == None:
			print(f'closing {worker}')
			worker.close()
			break

		print(msg)
		command, data = msg
		try:
			worker.send(command, data)
			response_queue.put(True)
		except Exception as e:
			print(e)
			response_queue.put(False)
			break

	print(f'end of worker {threading.get_ident()})')

	


// get database
const db = require('../app.js').db;

// utils
const { nanoid } = require('nanoid');
const eventDefs = require('../data/eventsDefinition.js');

// incrementFrom
function incrementFrom(start, incr = 1) {
  let entries = db.get('events').sortBy('order').value();

  entries.map((e) => {
    if (e.order < start) return;
    db.get('events')
      .find({ id: e.id })
      .assign({ order: e.order + incr })
      .write();
  });
}

function _getEventsCount() {
  return db.get('events').size().value();
}

function _pushNew(entry) {
  return db.get('events').push(entry).write();
}

function _removeById(eventId) {
  return db.get('events').remove({ id: eventId }).write();
}

function getEventEvents() {
  return db
    .get('events')
    .chain()
    .filter({ type: 'event' })
    .sortBy('order')
    .value();
}

function _updateTimers() {
  const results = getEventEvents();
  global.timer.updateEventList(results);
}

// Create controller for GET request to '/events'
// Returns -
exports.eventsGetAll = async (req, res) => {
  const results = db.get('events').sortBy('order').value();
  res.json(results);
};

// Create controller for GET request to '/events/:eventId'
// Returns -
exports.eventsGetById = async (req, res) => {
  const e = db.get('events').find({ id: req.params.eventId }).value();
  res.json(e);
};

// Create controller for POST request to '/events/'
// Returns -
exports.eventsPost = async (req, res) => {
  // TODO: Validate event
  if (!req.body) {
    res.status(400).send(`No object found in request`);
    return;
  }

  // ensure structure
  let newEvent = {};
  req.body.id = nanoid(6);

  switch (req.body.type) {
    case 'event':
      newEvent = { ...eventDefs.event, ...req.body };
      break;
    case 'delay':
      newEvent = { ...eventDefs.delay, ...req.body };
      break;
    case 'block':
      newEvent = { ...eventDefs.block, ...req.body };
      break;

    default:
      res
        .status(400)
        .send(`Object type missing or unrecognised: ${req.body.type}`);
      break;
  }

  try {
    // increment count if necessary
    const c = _getEventsCount();

    if (newEvent.order < c) incrementFrom(newEvent.order);

    // add new event
    _pushNew(newEvent);

    // update timers
    _updateTimers();

    // reply OK
    res.sendStatus(201);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Create controller for PUT request to '/events/'
// Returns -
exports.eventsPut = async (req, res) => {
  // no valid params
  if (!req.body) {
    res.status(400).send(`No object found`);
    return;
  }

  let eventId = req.body.id;
  if (!eventId) {
    res.status(400).send(`Object malformed: id missing`);
    return;
  }

  try {
    db.get('events')
      .find({ id: req.body.id })
      .assign({ ...req.body })
      .write();
    _updateTimers();

    res.sendStatus(200);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Create controller for PATCH request to '/events/'
// Returns -
exports.eventsPatch = async (req, res) => {
  // no valid params
  if (!req.body) {
    res.status(400).send(`No object found`);
    return;
  }

  let eventId = req.body.id;
  if (!eventId) {
    res.status(400).send(`No id found`);
    return;
  }

  try {
    db.get('events')
      .find({ id: req.body.id })
      .assign({ ...req.body })
      .write();

    // update timer
    // TODO: update single values when possible
    _updateTimers();

    res.sendStatus(200);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Create controller for DELETE request to '/events/:eventId'
// Returns -
exports.eventsDelete = async (req, res) => {
  // no valid params
  if (!req.params.eventId) {
    res.status(400).send(`No id found in request`);
    return;
  }

  try {
    // increment count if necessary
    const c = _getEventsCount();
    const e = db.get('events').find({ id: req.params.eventId }).value();

    if (c > 0 && e.order < c) incrementFrom(e.order, -1);

    // add new event
    _removeById(req.params.eventId);

    // update timer
    _updateTimers();

    res.sendStatus(201);
  } catch (error) {
    res.status(400).send(error);
  }
};

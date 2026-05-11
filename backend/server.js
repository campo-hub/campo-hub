import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { ObjectId } from 'mongodb';
import { connectDb, getCollection } from './db.js';
import { authenticateFirebase } from './auth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

dotenv.config();

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('CORS origin denied'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

const requestRates = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120);

app.use((req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const record = requestRates.get(ip) || { count: 0, start: now };

  if (now - record.start > RATE_LIMIT_WINDOW_MS) {
    record.count = 0;
    record.start = now;
  }

  record.count += 1;
  requestRates.set(ip, record);

  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }

  next();
});

const port = Number(process.env.PORT || 4000);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function sanitizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : [];
}

function getSafePrice(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function isValidImageMimeType(mimetype) {
  return ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].includes(mimetype);
}

function validateDateString(value) {
  if (!isNonEmptyString(value)) return false;
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}

function formatUser(user) {
  return {
    uid: user.uid,
    email: user.email || null,
    name: user.name,
    photoURL: user.photoURL || null,
    role: user.role || 'student',
    createdAt: user.createdAt,
    lastSeenAt: user.lastSeenAt,
  };
}

function mapUser(decoded) {
  return {
    uid: decoded.uid,
    email: decoded.email || null,
    name: decoded.name || decoded.email?.split('@')[0] || 'Campus User',
    photoURL: decoded.picture || decoded.photoURL || null,
  };
}

async function ensureUser(decoded) {
  const user = mapUser(decoded);
  const users = getCollection('users');
  const existing = await users.findOne({ uid: user.uid });

  if (existing) {
    const updated = {
      ...existing,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      lastSeenAt: new Date(),
    };
    await users.updateOne(
      { uid: user.uid },
      { $set: updated }
    );
    return updated;
  }

  const firstAdminExists = await users.findOne({ role: 'admin' });
  const role = firstAdminExists ? 'student' : 'admin';
  const newUser = {
    ...user,
    role,
    createdAt: new Date(),
    lastSeenAt: new Date(),
  };

  await users.insertOne(newUser);
  return newUser;
}

function formatListing(listing) {
  return {
    _id: listing._id.toString(),
    title: listing.title,
    description: listing.description,
    price: listing.price,
    category: listing.category,
    campus: listing.campus,
    condition: listing.condition,
    negotiable: listing.negotiable,
    sellerUid: listing.authorUid,
    sellerName: listing.authorName,
    sellerEmail: listing.authorEmail,
    sellerPhone: listing.sellerPhone,
    sellerPhotoURL: listing.authorPhotoURL || null,
    images: listing.images || [],
    createdAt: listing.createdAt,
  };
}

function formatService(service) {
  return {
    _id: service._id.toString(),
    title: service.title,
    description: service.description,
    price: service.price,
    category: service.category,
    providerUid: service.providerUid,
    providerName: service.providerName,
    providerPhone: service.providerPhone,
    providerEmail: service.providerEmail,
    providerPhotoURL: service.providerPhotoURL || null,
    images: service.images || [],
    createdAt: service.createdAt,
  };
}

function formatFeedPost(post) {
  return {
    _id: post._id.toString(),
    title: post.title,
    content: post.content,
    type: post.type,
    authorUid: post.authorUid,
    author: post.author,
    authorPhotoURL: post.authorPhotoURL || null,
    image: post.image || null,
    likes: Array.isArray(post.likes) ? post.likes : [],
    comments: Array.isArray(post.comments) ? post.comments.map(comment => ({
      ...comment,
      _id: comment._id.toString(),
    })) : [],
    shares: post.shares || 0,
    createdAt: post.createdAt,
  };
}

function formatEvent(event) {
  return {
    _id: event._id.toString(),
    title: event.title,
    date: event.date,
    location: event.location,
    description: event.description,
    createdByUid: event.createdByUid,
    createdAt: event.createdAt,
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/upload', authenticateFirebase, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }
  if (!isValidImageMimeType(req.file.mimetype)) {
    return res.status(415).json({ error: 'Unsupported file type' });
  }
  if (req.file.size > 20 * 1024 * 1024) {
    return res.status(413).json({ error: 'File is too large' });
  }

  const image = {
    data: req.file.buffer,
    contentType: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.user.uid,
    createdAt: new Date(),
  };
  const result = await getCollection('images').insertOne(image);
  res.json({ _id: result.insertedId.toString(), url: `/images/${result.insertedId.toString()}` });
});

app.get('/images/:id', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid image id' });
  }
  const image = await getCollection('images').findOne({ _id: new ObjectId(id) });
  if (!image) {
    return res.status(404).json({ error: 'Image not found' });
  }
  res.set('Content-Type', image.contentType);
  res.set('Cache-Control', 'public, max-age=31536000');
  res.send(image.data.buffer);
});

app.get('/users/me', authenticateFirebase, async (req, res) => {
  const profile = await ensureUser(req.user);
  res.json(formatUser(profile));
});

app.patch('/users/me', authenticateFirebase, async (req, res) => {
  const { name, photoURL } = req.body;
  const updates = {};
  if (isNonEmptyString(name)) updates.name = sanitizeString(name);
  if (isNonEmptyString(photoURL)) updates.photoURL = sanitizeString(photoURL);
  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: 'Name or photoURL is required to update profile' });
  }

  await ensureUser(req.user);
  updates.lastSeenAt = new Date();
  await getCollection('users').updateOne({ uid: req.user.uid }, { $set: updates });
  const profile = await getCollection('users').findOne({ uid: req.user.uid });
  res.json(formatUser(profile));
});

app.get('/listings', async (req, res) => {
  const listings = await getCollection('listings').find({}).sort({ createdAt: -1 }).toArray();
  res.json(listings.map(formatListing));
});

app.get('/listings/:id', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid listing id' });
  }
  const listing = await getCollection('listings').findOne({ _id: new ObjectId(id) });
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  res.json(formatListing(listing));
});

app.post('/listings', authenticateFirebase, async (req, res) => {
  const title = sanitizeString(req.body.title);
  const description = sanitizeString(req.body.description);
  const price = getSafePrice(req.body.price);
  const category = sanitizeString(req.body.category) || 'General';
  const campus = sanitizeString(req.body.campus) || 'Campus';
  const condition = sanitizeString(req.body.condition) || 'Used - Good';
  const negotiable = Boolean(req.body.negotiable);
  const sellerPhone = sanitizeString(req.body.sellerPhone);
  const sellerEmail = sanitizeString(req.body.sellerEmail);
  const images = sanitizeStringArray(req.body.images);

  if (!title || price === null) {
    return res.status(400).json({ error: 'Title and price are required' });
  }

  const author = mapUser(req.user);
  const listing = {
    title,
    description,
    price,
    category,
    campus,
    condition,
    negotiable,
    authorUid: author.uid,
    authorName: author.name,
    authorEmail: author.email || null,
    authorPhotoURL: author.photoURL || null,
    sellerPhone,
    sellerEmail: sellerEmail || author.email || null,
    images,
    createdAt: new Date(),
  };

  const result = await getCollection('listings').insertOne(listing);
  res.status(201).json(formatListing({ _id: result.insertedId, ...listing }));
});

app.get('/services', async (req, res) => {
  const services = await getCollection('services').find({}).sort({ createdAt: -1 }).toArray();
  res.json(services.map(formatService));
});

app.get('/services/:id', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid service id' });
  }
  const service = await getCollection('services').findOne({ _id: new ObjectId(id) });
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  res.json(formatService(service));
});

app.post('/services', authenticateFirebase, async (req, res) => {
  const title = sanitizeString(req.body.title);
  const description = sanitizeString(req.body.description);
  const price = getSafePrice(req.body.price);
  const category = sanitizeString(req.body.category) || 'Other';
  const providerPhone = sanitizeString(req.body.providerPhone);
  const providerEmail = sanitizeString(req.body.providerEmail);
  const images = sanitizeStringArray(req.body.images);

  if (!title || price === null) {
    return res.status(400).json({ error: 'Title and price are required' });
  }

  const author = mapUser(req.user);
  const service = {
    title,
    description,
    price,
    category,
    providerUid: author.uid,
    providerName: author.name,
    providerPhotoURL: author.photoURL || null,
    providerPhone,
    providerEmail: providerEmail || author.email || null,
    images,
    createdAt: new Date(),
  };

  const result = await getCollection('services').insertOne(service);
  res.status(201).json(formatService({ _id: result.insertedId, ...service }));
});

app.get('/events', async (req, res) => {
  const events = await getCollection('events').find({}).sort({ createdAt: -1 }).toArray();
  res.json(events.map(formatEvent));
});

app.post('/events', authenticateFirebase, async (req, res) => {
  const profile = await ensureUser(req.user);
  if (profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const title = sanitizeString(req.body.title);
  const date = sanitizeString(req.body.date);
  const location = sanitizeString(req.body.location);
  const description = sanitizeString(req.body.description);

  if (!title || !date || !location || !description) {
    return res.status(400).json({ error: 'All event fields are required' });
  }
  if (!validateDateString(date)) {
    return res.status(400).json({ error: 'Invalid event date' });
  }

  const event = {
    title,
    date,
    location,
    description,
    createdByUid: profile.uid,
    createdAt: new Date(),
  };

  const result = await getCollection('events').insertOne(event);
  res.status(201).json(formatEvent({ _id: result.insertedId, ...event }));
});

app.get('/feed', async (req, res) => {
  const feed = await getCollection('feedPosts').find({}).sort({ createdAt: -1 }).toArray();
  res.json(feed.map(formatFeedPost));
});

app.post('/feed', authenticateFirebase, async (req, res) => {
  const title = sanitizeString(req.body.title);
  const content = sanitizeString(req.body.content);
  const type = sanitizeString(req.body.type);
  const image = isNonEmptyString(req.body.image) ? sanitizeString(req.body.image) : null;

  if (!title || !content || !type) {
    return res.status(400).json({ error: 'Title, content, and type are required' });
  }
  if (title.length > 150 || content.length > 2000) {
    return res.status(400).json({ error: 'Post title or content exceeds allowed length' });
  }

  const author = mapUser(req.user);
  const post = {
    title,
    content,
    type,
    image,
    authorUid: author.uid,
    author: author.name,
    authorPhotoURL: author.photoURL || null,
    likes: [],
    comments: [],
    shares: 0,
    createdAt: new Date(),
  };

  const result = await getCollection('feedPosts').insertOne(post);
  res.status(201).json(formatFeedPost({ _id: result.insertedId, ...post }));
});

app.post('/feed/:id/like', authenticateFirebase, async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid feed id' });
  }
  const collection = getCollection('feedPosts');
  const post = await collection.findOne({ _id: new ObjectId(id) });
  if (!post) return res.status(404).json({ error: 'Feed post not found' });

  const likes = Array.isArray(post.likes) ? post.likes : [];
  const hasLiked = likes.includes(req.user.uid);
  const update = hasLiked
    ? { $pull: { likes: req.user.uid } }
    : { $addToSet: { likes: req.user.uid } };
  await collection.updateOne({ _id: new ObjectId(id) }, update);
  res.json({ success: true });
});

app.post('/feed/:id/comment', authenticateFirebase, async (req, res) => {
  const { id } = req.params;
  const text = sanitizeString(req.body.text);
  if (!text) {
    return res.status(400).json({ error: 'Comment text is required' });
  }
  if (text.length > 500) {
    return res.status(400).json({ error: 'Comment text is too long' });
  }
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid feed id' });
  }

  const author = mapUser(req.user);
  const comment = {
    _id: new ObjectId().toString(),
    author: author.name,
    authorUid: author.uid,
    text,
    createdAt: new Date(),
  };

  const result = await getCollection('feedPosts').updateOne(
    { _id: new ObjectId(id) },
    { $push: { comments: comment } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Feed post not found' });
  }

  res.json({ success: true });
});

app.post('/feed/:id/share', authenticateFirebase, async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid feed id' });
  }

  const result = await getCollection('feedPosts').updateOne(
    { _id: new ObjectId(id) },
    { $inc: { shares: 1 } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Feed post not found' });
  }

  res.json({ success: true });
});

app.get('/chats', authenticateFirebase, async (req, res) => {
  const chats = await getCollection('chats')
    .find({ users: req.user.uid })
    .sort({ updatedAt: -1 })
    .toArray();

  const userDocs = await getCollection('users')
    .find({ uid: { $in: chats.flatMap(chat => chat.users.filter(uid => uid !== req.user.uid)) } })
    .toArray();

  const formatted = chats.map(chat => {
    const otherUid = chat.users.find(u => u !== req.user.uid);
    const otherUser = userDocs.find(u => u.uid === otherUid);
    const lastMessage = chat.messages?.[chat.messages.length - 1];
    return {
      _id: chat._id.toString(),
      otherUserName: otherUser?.name || 'Student',
      otherUserPhotoURL: otherUser?.photoURL || null,
      listingId: chat.listingId,
      listingTitle: chat.listingTitle,
      lastMessage: lastMessage?.text || null,
      updatedAt: chat.updatedAt,
    };
  });

  res.json(formatted);
});

app.get('/chats/:id', authenticateFirebase, async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid chat id' });
  }

  const chat = await getCollection('chats').findOne({ _id: new ObjectId(id), users: req.user.uid });
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  const otherUid = chat.users.find(u => u !== req.user.uid);
  const otherUser = otherUid ? await getCollection('users').findOne({ uid: otherUid }) : null;

  res.json({
    _id: chat._id.toString(),
    otherUserName: otherUser?.name || 'Student',
    otherUserPhotoURL: otherUser?.photoURL || null,
    listingId: chat.listingId,
    listingTitle: chat.listingTitle,
    messages: (chat.messages || []).map(message => ({
      ...message,
      _id: message._id?.toString ? message._id.toString() : message._id,
    })),
  });
});

app.post('/chats', authenticateFirebase, async (req, res) => {
  const otherUid = sanitizeString(req.body.otherUid);
  const listingId = sanitizeString(req.body.listingId);

  if (!otherUid) {
    return res.status(400).json({ error: 'otherUid is required' });
  }
  if (otherUid === req.user.uid) {
    return res.status(400).json({ error: 'Cannot create chat with yourself' });
  }

  const otherUser = await getCollection('users').findOne({ uid: otherUid });
  if (!otherUser) {
    return res.status(404).json({ error: 'Other user not found' });
  }

  const existingChat = await getCollection('chats').findOne({
    users: { $all: [req.user.uid, otherUid] },
    listingId: listingId || null,
  });

  if (existingChat) {
    return res.json({ _id: existingChat._id.toString() });
  }

  let listingTitle = null;
  if (listingId && ObjectId.isValid(listingId)) {
    const listing = await getCollection('listings').findOne({ _id: new ObjectId(listingId) });
    listingTitle = listing?.title || null;
  }

  const chat = {
    users: [req.user.uid, otherUid],
    listingId: listingId || null,
    listingTitle,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await getCollection('chats').insertOne(chat);
  res.status(201).json({ _id: result.insertedId.toString() });
});

app.post('/chats/:id/messages', authenticateFirebase, async (req, res) => {
  const { id } = req.params;
  const text = sanitizeString(req.body.text);
  if (!text) {
    return res.status(400).json({ error: 'Message text is required' });
  }
  if (text.length > 1000) {
    return res.status(400).json({ error: 'Message text is too long' });
  }
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid chat id' });
  }

  const message = {
    _id: new ObjectId(),
    fromUid: req.user.uid,
    text,
    createdAt: new Date(),
  };

  const result = await getCollection('chats').updateOne(
    { _id: new ObjectId(id), users: req.user.uid },
    { $push: { messages: message }, $set: { updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Chat not found or access denied' });
  }

  res.json({ success: true });
});

app.get('/admin/stats', authenticateFirebase, async (req, res) => {
  const profile = await ensureUser(req.user);
  if (profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const [totalUsers, totalListings, totalChats, totalFeedPosts] = await Promise.all([
    getCollection('users').countDocuments(),
    getCollection('listings').countDocuments(),
    getCollection('chats').countDocuments(),
    getCollection('feedPosts').countDocuments(),
  ]);

  res.json({ totalUsers, totalListings, totalChats, totalFeedPosts });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

async function start() {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`Backend server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();

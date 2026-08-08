import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppDataSource } from "../server";
import { authMiddleware } from "../middleware/auth";
import { AdminUser } from "../models/AdminUser";
import { Artist } from "../models/Artist";
import { Album } from "../models/Album";
import { Song } from "../models/Song";
import { BlogPost } from "../models/BlogPost";
import { Concert } from "../models/Concert";
import { Gallery } from "../models/Gallery";

const router = express.Router();

// LOGIN
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const admin = await AppDataSource.getRepository(AdminUser).findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    admin.lastLogin = new Date();
    await AppDataSource.getRepository(AdminUser).save(admin);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Server configuration error" });
    }
    const expiration = process.env.JWT_EXPIRATION || "15m";
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      secret,
      { expiresIn: expiration } as any
    );

    res.json({ token, admin: { id: admin.id, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// ARTIST - Update
router.patch("/artist", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, bio, profileImage, socialLinks, stats } = req.body;
    let artist = await AppDataSource.getRepository(Artist).findOne({ where: { name: "Mouhamed VJ" } });

    if (!artist) {
      artist = AppDataSource.getRepository(Artist).create({
        name: "Mouhamed VJ",
        bio,
        profileImage,
        socialLinks,
        stats
      });
    } else {
      if (bio !== undefined) artist.bio = bio;
      if (profileImage !== undefined) artist.profileImage = profileImage;
      if (socialLinks !== undefined) artist.socialLinks = socialLinks;
      if (stats !== undefined) artist.stats = stats;
    }

    const updated = await AppDataSource.getRepository(Artist).save(artist);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// ALBUMS - Create
router.post("/albums", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, description, releaseDate, coverImage, artistId } = req.body;
    const artistRepository = AppDataSource.getRepository(Artist);

    let artist;
    if (artistId) {
      artist = await artistRepository.findOne({ where: { id: artistId } });
    } else {
      artist = await artistRepository.findOne({ where: { name: "Mouhamed VJ" } });
    }

    // If artist still not found, create default
    if (!artist) {
      artist = artistRepository.create({ name: "Mouhamed VJ" });
      artist = await artistRepository.save(artist);
    }

    const album = AppDataSource.getRepository(Album).create({
      title,
      description,
      releaseDate: new Date(releaseDate),
      coverImage,
      artist,
      artistId: artist.id
    });

    const saved = await AppDataSource.getRepository(Album).save(album);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// ALBUMS - Update
router.patch("/albums/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const album = await AppDataSource.getRepository(Album).findOne({ where: { id: req.params.id } });
    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    const { title, description, releaseDate, coverImage } = req.body;
    if (title) album.title = title;
    if (description) album.description = description;
    if (releaseDate) album.releaseDate = new Date(releaseDate);
    if (coverImage) album.coverImage = coverImage;

    const updated = await AppDataSource.getRepository(Album).save(album);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// ALBUMS - Delete
router.delete("/albums/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const album = await AppDataSource.getRepository(Album).findOne({ where: { id: req.params.id } });
    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    await AppDataSource.getRepository(Album).remove(album);
    res.json({ message: "Album deleted" });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// SONGS - Create
router.post("/songs", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, duration, audioUrl, lyrics, albumId, youtubeUrl, releaseDate, streams } = req.body;

    let album = null;
    if (albumId) {
      album = await AppDataSource.getRepository(Album).findOne({ where: { id: albumId } });
      if (!album) {
        return res.status(404).json({ error: "Album not found" });
      }
    }

    const song = AppDataSource.getRepository(Song).create({
      title,
      duration,
      audioUrl,
      lyrics,
      youtubeUrl,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      streams: streams || 0,
      album,
      albumId: albumId || null
    } as any);

    const saved = await AppDataSource.getRepository(Song).save(song);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// SONGS - Update
router.patch("/songs/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const song = await AppDataSource.getRepository(Song).findOne({ where: { id: req.params.id } });
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    const { title, duration, audioUrl, lyrics, streams, youtubeUrl, releaseDate } = req.body;
    if (title) song.title = title;
    if (duration) song.duration = duration;
    if (audioUrl) song.audioUrl = audioUrl;
    if (lyrics) song.lyrics = lyrics;
    if (streams !== undefined) song.streams = streams;
    if (youtubeUrl) song.youtubeUrl = youtubeUrl;
    if (releaseDate) song.releaseDate = new Date(releaseDate);

    const updated = await AppDataSource.getRepository(Song).save(song);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// SONGS - Delete
router.delete("/songs/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const song = await AppDataSource.getRepository(Song).findOne({ where: { id: req.params.id } });
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    await AppDataSource.getRepository(Song).remove(song);
    res.json({ message: "Song deleted" });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// BLOG - Create
router.post("/blog", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, featuredImage, published, publishedAt } = req.body;
    const artist = await AppDataSource.getRepository(Artist).findOne({ where: { name: "Mouhamed VJ" } });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const post = AppDataSource.getRepository(BlogPost).create({
      title,
      content,
      excerpt,
      featuredImage,
      published,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      artist,
      artistId: artist.id
    } as any);

    const saved = await AppDataSource.getRepository(BlogPost).save(post);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// BLOG - Update
router.patch("/blog/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const post = await AppDataSource.getRepository(BlogPost).findOne({ where: { id: req.params.id } });
    if (!post) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const { title, content, excerpt, featuredImage, published, publishedAt } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (excerpt) post.excerpt = excerpt;
    if (featuredImage) post.featuredImage = featuredImage;
    if (published !== undefined) post.published = published;
    if (publishedAt) post.publishedAt = new Date(publishedAt);

    const updated = await AppDataSource.getRepository(BlogPost).save(post);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// BLOG - Delete
router.delete("/blog/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const post = await AppDataSource.getRepository(BlogPost).findOne({ where: { id: req.params.id } });
    if (!post) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    await AppDataSource.getRepository(BlogPost).remove(post);
    res.json({ message: "Blog post deleted" });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// CONCERTS - Create
router.post("/concerts", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, description, location, date, ticketUrl, image, status } = req.body;
    const artist = await AppDataSource.getRepository(Artist).findOne({ where: { name: "Mouhamed VJ" } });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const concert = AppDataSource.getRepository(Concert).create({
      title,
      description,
      location,
      date: new Date(date),
      ticketUrl,
      image,
      status: status || "upcoming",
      artist,
      artistId: artist.id
    });

    const saved = await AppDataSource.getRepository(Concert).save(concert);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// CONCERTS - Update
router.patch("/concerts/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const concert = await AppDataSource.getRepository(Concert).findOne({ where: { id: req.params.id } });
    if (!concert) {
      return res.status(404).json({ error: "Concert not found" });
    }

    const { title, description, location, date, ticketUrl, image, status } = req.body;
    if (title) concert.title = title;
    if (description) concert.description = description;
    if (location) concert.location = location;
    if (date) concert.date = new Date(date);
    if (ticketUrl) concert.ticketUrl = ticketUrl;
    if (image) concert.image = image;
    if (status) concert.status = status;

    const updated = await AppDataSource.getRepository(Concert).save(concert);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// CONCERTS - Delete
router.delete("/concerts/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const concert = await AppDataSource.getRepository(Concert).findOne({ where: { id: req.params.id } });
    if (!concert) {
      return res.status(404).json({ error: "Concert not found" });
    }

    await AppDataSource.getRepository(Concert).remove(concert);
    res.json({ message: "Concert deleted" });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// GALLERY - Create
router.post("/gallery", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type, title, url, category, description, startTime } = req.body;
    const artist = await AppDataSource.getRepository(Artist).findOne({ where: { name: "Mouhamed VJ" } });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const media = AppDataSource.getRepository(Gallery).create({
      type,
      title,
      url,
      category,
      description,
      startTime: startTime ? parseInt(startTime) : undefined,
      artist,
      artistId: artist.id
    });

    const saved = await AppDataSource.getRepository(Gallery).save(media);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// GALLERY - Update
router.patch("/gallery/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const media = await AppDataSource.getRepository(Gallery).findOne({ where: { id: req.params.id } });
    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    const { type, title, url, category, description, startTime } = req.body;
    if (type) media.type = type;
    if (title) media.title = title;
    if (url) media.url = url;
    if (category) media.category = category;
    if (description) media.description = description;
    if (startTime !== undefined) media.startTime = startTime ? parseInt(startTime) : undefined;

    const updated = await AppDataSource.getRepository(Gallery).save(media);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// GALLERY - Delete
router.delete("/gallery/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const media = await AppDataSource.getRepository(Gallery).findOne({ where: { id: req.params.id } });
    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    await AppDataSource.getRepository(Gallery).remove(media);
    res.json({ message: "Media deleted" });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

export default router;

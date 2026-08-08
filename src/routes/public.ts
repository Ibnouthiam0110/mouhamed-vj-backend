import express from "express";
import { AppDataSource } from "../server";
import { Artist } from "../models/Artist";
import { Album } from "../models/Album";
import { Song } from "../models/Song";
import { BlogPost } from "../models/BlogPost";
import { Concert } from "../models/Concert";
import { Gallery } from "../models/Gallery";

const router = express.Router();

// Artist endpoints
router.get("/artist", async (req, res) => {
  try {
    const artistRepository = AppDataSource.getRepository(Artist);
    let artist = await artistRepository.findOne({
      where: { name: "Mouhamed VJ" },
      relations: ["albums", "blogPosts", "concerts", "gallery"]
    });

    // If no artist exists, create a default one
    if (!artist) {
      artist = artistRepository.create({
        name: "Mouhamed VJ",
        bio: "",
        profileImage: "",
        socialLinks: { facebook: "", instagram: "", youtube: "", spotify: "" },
        stats: { streams: 0, followers: 0 }
      });
      await artistRepository.save(artist);
    }
    res.json(artist);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// Albums endpoints
router.get("/albums", async (req, res) => {
  try {
    const albums = await AppDataSource.getRepository(Album).find({
      relations: ["artist", "songs"],
      order: { releaseDate: "DESC" }
    });
    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

router.get("/albums/:id", async (req, res) => {
  try {
    const album = await AppDataSource.getRepository(Album).findOne({
      where: { id: req.params.id },
      relations: ["artist", "songs"]
    });
    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }
    res.json(album);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// Songs endpoints
router.get("/songs", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [songs, total] = await AppDataSource.getRepository(Song).findAndCount({
      relations: ["album"],
      skip,
      take: limit,
      order: { createdAt: "DESC" }
    });
    res.json({ data: songs, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

router.get("/songs/:id", async (req, res) => {
  try {
    const song = await AppDataSource.getRepository(Song).findOne({
      where: { id: req.params.id },
      relations: ["album"]
    });
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json(song);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// Blog endpoints
router.get("/blog", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await AppDataSource.getRepository(BlogPost).findAndCount({
      where: { published: true },
      skip,
      take: limit,
      order: { publishedAt: "DESC" }
    });
    res.json({ data: posts, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

router.get("/blog/:id", async (req, res) => {
  try {
    const post = await AppDataSource.getRepository(BlogPost).findOne({
      where: { id: req.params.id }
    });
    if (!post) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// Concerts endpoints
router.get("/concerts", async (req, res) => {
  try {
    const concerts = await AppDataSource.getRepository(Concert).find({
      order: { date: "ASC" }
    });
    res.json(concerts);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

router.get("/concerts/:id", async (req, res) => {
  try {
    const concert = await AppDataSource.getRepository(Concert).findOne({
      where: { id: req.params.id }
    });
    if (!concert) {
      return res.status(404).json({ error: "Concert not found" });
    }
    res.json(concert);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// Gallery endpoints
router.get("/gallery", async (req, res) => {
  try {
    const category = req.query.category as string;
    const where = category ? { category } : {};
    const gallery = await AppDataSource.getRepository(Gallery).find({
      where,
      order: { createdAt: "DESC" }
    });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

router.get("/gallery/:id", async (req, res) => {
  try {
    const media = await AppDataSource.getRepository(Gallery).findOne({
      where: { id: req.params.id }
    });
    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

export default router;

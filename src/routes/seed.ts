import { Router, Request, Response } from "express";
import "reflect-metadata";
import { AppDataSource } from "../server";
import { Artist } from "../models/Artist";
import { Album } from "../models/Album";
import { Song } from "../models/Song";
import { BlogPost } from "../models/BlogPost";
import { Concert } from "../models/Concert";
import { Gallery } from "../models/Gallery";

const router = Router();

// ⚠️ TEMPORARY ROUTE — remove this file and its usage in server.ts after seeding once.
// Protected by SEED_SECRET env var, NOT your JWT_SECRET.
router.post("/run", async (req: Request, res: Response) => {
  const providedSecret = req.headers["x-seed-secret"];
  const expectedSecret = process.env.SEED_SECRET;

  if (!expectedSecret) {
    return res.status(500).json({ error: "SEED_SECRET not configured on server" });
  }
  if (providedSecret !== expectedSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const artistRepository = AppDataSource.getRepository(Artist);
    const albumRepository = AppDataSource.getRepository(Album);
    const songRepository = AppDataSource.getRepository(Song);
    const blogRepository = AppDataSource.getRepository(BlogPost);
    const concertRepository = AppDataSource.getRepository(Concert);
    const galleryRepository = AppDataSource.getRepository(Gallery);

    const existingArtist = await artistRepository.findOne({ where: { name: "Mouhamed VJ" } });
    if (existingArtist) {
      return res.status(200).json({ message: "⚠️ Data already exists, seed skipped." });
    }

    const artist = artistRepository.create({
      name: "Mouhamed VJ",
      bio: "Mouhamed VJ est une icône de la musique sénégalaise, connu pour ses performances énergiques et ses albums révolutionnaires. Avec plus de 700 millions de streams et une base de fans mondiale, il continue à inspirer les générations avec son style unique de mbalax.",
      profileImage: "https://via.placeholder.com/300?text=Mouhamed+VJ",
      socialLinks: {
        facebook: "https://facebook.com/mouhamedjvj",
        instagram: "https://instagram.com/mouhamedjvj",
        youtube: "https://youtube.com/mouhamedjvj",
        spotify: "https://spotify.com/artist/mouhamedjvj"
      },
      stats: {
        streams: 700000000,
        followers: 2500000
      }
    });
    await artistRepository.save(artist);

    const album1 = albumRepository.create({
      title: "État d'Esprit",
      description: "Album révolutionnaire qui a marqué la carrière de Mouhamed VJ",
      releaseDate: new Date("2022-01-15"),
      coverImage: "https://via.placeholder.com/300?text=État+d%27Esprit",
      artist
    });
    const album2 = albumRepository.create({
      title: "Entre Nous",
      description: "Un album intime et personnel",
      releaseDate: new Date("2024-03-20"),
      coverImage: "https://via.placeholder.com/300?text=Entre+Nous",
      artist
    });
    await albumRepository.save([album1, album2]);

    const songs = [
      { title: "Kaay Way", duration: 240, album: album1 },
      { title: "Mon Combat", duration: 280, album: album1 },
      { title: "Ballago", duration: 260, album: album1 },
      { title: "Entre Nous", duration: 250, album: album2 },
      { title: "Je t'aime", duration: 270, album: album2 }
    ];
    for (const songData of songs) {
      const song = songRepository.create({
        title: songData.title,
        duration: songData.duration,
        audioUrl: `https://via.placeholder.com/audio?text=${songData.title}`,
        streams: Math.floor(Math.random() * 50000000),
        album: songData.album
      });
      await songRepository.save(song);
    }

    const blogs = [
      {
        title: "Mes débuts dans la musique",
        content: "# Mes débuts\n\nJ'ai commencé ma carrière musicale à un jeune âge...",
        excerpt: "Découvrez comment tout a commencé",
        published: true
      },
      {
        title: "L'importance du mbalax traditionnel",
        content: "# Le mbalax\n\nLe mbalax est une fusion unique entre musique traditionnelle et moderne...",
        excerpt: "Pourquoi le mbalax représente notre culture",
        published: true
      }
    ];
    for (const blogData of blogs) {
      const blog = blogRepository.create({
        ...blogData,
        featuredImage: "https://via.placeholder.com/600?text=Blog",
        publishedAt: new Date(),
        artist
      });
      await blogRepository.save(blog);
    }

    const concerts = [
      {
        title: "Live Performance - Paris",
        location: "Zénith Paris",
        date: new Date("2026-08-15"),
        status: "upcoming" as const
      },
      {
        title: "Festival Afro-Music 2026",
        location: "Dakar, Sénégal",
        date: new Date("2026-09-20"),
        status: "upcoming" as const
      },
      {
        title: "Tour USA - New York",
        location: "Madison Square Garden",
        date: new Date("2026-10-10"),
        status: "upcoming" as const
      }
    ];
    for (const concertData of concerts) {
      const concert = concertRepository.create({
        ...concertData,
        description: "Un concert inoubliable",
        image: "https://via.placeholder.com/600?text=Concert",
        ticketUrl: "https://ticketmaster.com",
        artist
      });
      await concertRepository.save(concert);
    }

    const galleryItems = [
      { type: "photo", title: "Live au concert", category: "concert" },
      { type: "photo", title: "En studio", category: "studio" },
      { type: "photo", title: "Moment candide", category: "candid" },
      { type: "video", title: "Kaay Way - Official Video", category: "video" }
    ];
    for (const item of galleryItems) {
      const media = galleryRepository.create({
        type: item.type as any,
        title: item.title,
        url: item.type === "video" ? "https://www.youtube.com/embed/dQw4w9WgXcQ" : "https://via.placeholder.com/400",
        category: item.category,
        description: "Image/vidéo de Mouhamed VJ",
        artist
      });
      await galleryRepository.save(media);
    }

    return res.status(200).json({ message: "✅ Seed data created successfully!" });
  } catch (error: any) {
    console.error("❌ Seed error:", error);
    return res.status(500).json({ error: error.message || "Seed failed" });
  }
});

export default router;
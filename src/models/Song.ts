import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Album } from "./Album";

@Entity("songs")
export class Song {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  duration?: number; // in seconds

  @Column({ nullable: true })
  audioUrl?: string;

  @Column("text", { nullable: true })
  lyrics?: string;

  @Column({ nullable: true })
  youtubeUrl?: string;

  @Column({ nullable: true })
  releaseDate?: Date;

  @Column({ default: 0 })
  streams!: number;

  @ManyToOne(() => Album, album => album.songs, { onDelete: "CASCADE", nullable: true })
  album?: Album;

  @Column({ nullable: true })
  albumId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

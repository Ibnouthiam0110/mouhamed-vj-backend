import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Artist } from "./Artist";

@Entity("gallery")
export class Gallery {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "enum", enum: ["photo", "video"] })
  type!: "photo" | "video";

  @Column()
  title!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  category!: string; // concert, studio, candid, etc.

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true, type: "int" })
  startTime?: number; // in seconds

  @ManyToOne(() => Artist, artist => artist.gallery, { onDelete: "CASCADE" })
  artist!: Artist;

  @Column()
  artistId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

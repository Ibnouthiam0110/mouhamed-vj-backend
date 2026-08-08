import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Artist } from "./Artist";
import { Song } from "./Song";

@Entity("albums")
export class Album {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column({ nullable: true })
  releaseDate!: Date;

  @Column({ nullable: true })
  coverImage!: string;

  @ManyToOne(() => Artist, artist => artist.albums, { onDelete: "CASCADE" })
  artist!: Artist;

  @Column()
  artistId!: string;

  @OneToMany(() => Song, song => song.album)
  songs!: Song[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

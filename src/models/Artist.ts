import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Album } from "./Album";
import { BlogPost } from "./BlogPost";
import { Concert } from "./Concert";
import { Gallery } from "./Gallery";

@Entity("artists")
export class Artist {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column("text", { nullable: true })
  bio!: string;

  @Column({ nullable: true })
  profileImage!: string;

  @Column("simple-json", { nullable: true })
  socialLinks!: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    spotify?: string;
    twitter?: string;
    tiktok?: string;
  };

  @Column("simple-json", { nullable: true })
  stats!: {
    streams?: number;
    followers?: number;
  };

  @OneToMany(() => Album, album => album.artist)
  albums!: Album[];

  @OneToMany(() => BlogPost, blogPost => blogPost.artist)
  blogPosts!: BlogPost[];

  @OneToMany(() => Concert, concert => concert.artist)
  concerts!: Concert[];

  @OneToMany(() => Gallery, gallery => gallery.artist)
  gallery!: Gallery[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

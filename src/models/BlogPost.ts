import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Artist } from "./Artist";

@Entity("blog_posts")
export class BlogPost {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  content!: string; // Markdown content

  @Column({ nullable: true })
  excerpt!: string;

  @Column({ nullable: true })
  featuredImage!: string;

  @Column({ default: false })
  published!: boolean;

  @Column({ nullable: true })
  publishedAt!: Date;

  @ManyToOne(() => Artist, artist => artist.blogPosts, { onDelete: "CASCADE" })
  artist!: Artist;

  @Column()
  artistId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

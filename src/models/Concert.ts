import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Artist } from "./Artist";

@Entity("concerts")
export class Concert {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column()
  location!: string;

  @Column()
  date!: Date;

  @Column({ nullable: true })
  ticketUrl!: string;

  @Column({ nullable: true })
  image!: string;

  @Column({
    type: "enum",
    enum: ["upcoming", "live", "past"],
    default: "upcoming"
  })
  status!: "upcoming" | "live" | "past";

  @ManyToOne(() => Artist, artist => artist.concerts, { onDelete: "CASCADE" })
  artist!: Artist;

  @Column()
  artistId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

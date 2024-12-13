import { MetaclassType, StType } from "@hfdraw/types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: 'model'
})
export class Model {
    @PrimaryGeneratedColumn()
    id_: number 

    @Column({
        type: String,
        nullable: false,
      })
      id: string;
    
      @Column({
        type: String,
        nullable: true
      })
      name: string;
      @Column({
        nullable: true,
        type: String,
        collation: 'BINARY'
    
      })
      ownerId: string
      @Column({
        nullable: false,
        type: String,
    
      })
      projectId: string
    
      @Column({
        type: String
      })
      metaclass: MetaclassType
      @Column({
        type: "simple-json",
        nullable: true
    
      })
      sts:string[]
      @Column({
        type: 'boolean',
        default: 0
      })
      isDelete:boolean
      /**
   * 基础stereotype
   *
   */
  @Column({
    nullable: true,
    type: String
  })
  baseSt?: StType
}
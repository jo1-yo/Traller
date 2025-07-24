import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('query_results')
export class QueryResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  originalQuery: string;

  @Column({ type: 'text' })
  queryType: string; // 'link' | 'person' | 'other'

  @Column({ type: 'text' })
  structuredData: string; // JSON string of the structured result

  @Column({ type: 'text', nullable: true })
  perplexityResponse: string; // Raw response from Perplexity

  @Column({ type: 'text', nullable: true })
  kimiResponse: string; // Raw response from Kimi K2

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
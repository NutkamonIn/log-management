import { Client } from '@opensearch-project/opensearch';

// Connect -> OpenSearch Datasase on Docker
export const osClient = new Client({
    node: process.env.OPENSEARCH_URL || 'https://admin:admin@localhost:9200',
    ssl: { rejectUnauthorized: false } //ปิดการแจ้งเตือน SSL
});
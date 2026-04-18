
import { getCollection } from 'astro:content';

async function test() {
  try {
    const topics = await getCollection('topics');
    console.log('Topics found:', topics.length);
    topics.forEach(t => console.log('- ', t.id, ':', t.data.title));
  } catch (e) {
    console.error('Error fetching topics:', e);
  }
}

test();

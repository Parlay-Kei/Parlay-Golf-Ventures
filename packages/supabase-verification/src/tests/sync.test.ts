import { supabase } from '../supabaseClient';
import { apiPost } from '../appClient';
import { v4 as uuidv4 } from 'uuid';

describe('PGV ↔ Supabase data integrity', () => {
  const password = 'Ver1fy$' + uuidv4();

  test('Users → Profiles flow', async () => {
    const email = `qa_${uuidv4()}@example.com`;

    // Register user through app endpoint (adjust path)
    const user = await apiPost<{ id: string; email: string }>('/api/auth/register', {
      email,
      password
    });
    expect(user.email).toBe(email);

    // Verify user row exists in Supabase
    const { data: userRow, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    expect(error).toBeNull();
    expect(userRow?.email).toBe(email);

    // Update profile via app
    await apiPost('/api/profile/update', { display_name: 'QA Bot', bio: 'Automated test' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userRow!.id)
      .single();
    expect(profile?.display_name).toBe('QA Bot');
  });

  test('Community post creation sync', async () => {
    const slug = 'qa-' + uuidv4();
    const post = await apiPost('/api/posts', {
      title: 'Automated QA post',
      content: 'This is only a drill.',
      slug
    });
    expect(post.slug).toBe(slug);

    const { data: row } = await supabase
      .from('community_posts')
      .select('*')
      .eq('slug', slug)
      .single();
    expect(row?.slug).toBe(slug);
  });
});
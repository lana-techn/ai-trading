# 🗄️ Supabase Database Setup Guide

> **📚 Purpose**: Setup database untuk tutorial content management system menggunakan Supabase PostgreSQL

---

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `AI Trading Agent`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your location
4. Wait for project creation (2-3 minutes)

### 2. Get Configuration Keys

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: `eyJ...` (for public access)
   - **service_role secret key**: `eyJ...` (for admin operations)

### 3. Update Environment Variables

Create `.env` file in the backend directory:

```bash
cd /Users/em/web/trader-ai-agent/backend
cp ../.env.example .env
```

Update the `.env` file with your Supabase credentials:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Also create `.env.local` in the frontend directory:

```bash
cd /Users/em/web/trader-ai-agent/frontend
cp ../.env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

---

## 🗃️ Database Schema Setup

### 1. Run SQL Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire content of `/backend/database/schema.sql`
4. Paste and click **"Run"**

This will create:
- `tutorials` table
- `sections` table  
- `tutorial_tags` table
- `tutorial_tag_relations` table
- `tutorial_analytics` table
- Proper indexes and Row Level Security policies

### 2. Verify Tables Created

In **Table Editor**, you should see:
- ✅ tutorials (7 columns)
- ✅ sections (8 columns)
- ✅ tutorial_tags (4 columns)
- ✅ tutorial_tag_relations (2 columns)
- ✅ tutorial_analytics (8 columns)

---

## 📚 Migrate Tutorial Content

### 1. Prepare Migration Script

```bash
cd /Users/em/web/trader-ai-agent/backend
chmod +x scripts/migrate_tutorials.py
```

### 2. Run Migration

```bash
python3 scripts/migrate_tutorials.py
```

Expected output:
```
🚀 Starting tutorial migration to Supabase...
📄 Parsing TUTORIAL_TRADING_DASAR.md...
➕ Creating new tutorial: Tutorial Trading Dasar
📝 Inserting 6 sections...
🏷️  Added 4 tags
✅ Successfully migrated: Tutorial Trading Dasar
--------------------------------------------------
[... more tutorials ...]

📊 Migration Summary:
✅ Successful: 6/6
🎉 All tutorials migrated successfully!
```

### 3. Verify Data

In Supabase **Table Editor**:
- **tutorials**: Should have 6 rows
- **sections**: Should have 30+ rows  
- **tutorial_tags**: Should have 10 default tags
- **tutorial_tag_relations**: Should have tag associations

---

## 🔧 API Testing

### 1. Test Backend API

Start the backend server:
```bash
cd /Users/em/web/trader-ai-agent/backend
python3 minimal_server.py
```

Test endpoints:
```bash
# Get all tutorials
curl http://localhost:8000/api/v1/tutorials/

# Get specific tutorial
curl http://localhost:8000/api/v1/tutorials/trading-dasar

# Search tutorials
curl "http://localhost:8000/api/v1/tutorials/search?q=RSI"

# Get categories
curl http://localhost:8000/api/v1/tutorials/categories
```

### 2. Test Frontend Integration

```bash
cd /Users/em/web/trader-ai-agent/frontend
pnpm dev
```

Visit: http://localhost:3000
- Tutorial content should load from Supabase
- No more direct MD file reading
- Faster loading times
- Better search functionality

---

## 📊 Database Structure

### Tables Overview

```
┌─────────────────┐    ┌──────────────────┐
│   tutorials     │────│    sections      │
│ • id (PK)      │    │ • id (PK)        │
│ • title        │    │ • tutorial_id(FK)│
│ • slug         │    │ • title          │
│ • description  │    │ • content        │
│ • category     │    │ • order_index    │
└─────────────────┘    └──────────────────┘
         │
         │
┌─────────────────┐    ┌──────────────────┐
│tutorial_tag_rel │────│ tutorial_tags    │
│ • tutorial_id   │    │ • id (PK)        │
│ • tag_id        │    │ • name           │
└─────────────────┘    │ • color          │
                       └──────────────────┘

┌─────────────────┐
│tutorial_analytics│
│ • tutorial_id   │
│ • view_count    │
│ • avg_read_time │
└─────────────────┘
```

### Key Features

✅ **Row Level Security**: Public can only read published content
✅ **Full Text Search**: Search across titles, descriptions, and content
✅ **Analytics Tracking**: View counts and engagement metrics
✅ **Flexible Tagging**: Many-to-many tag relationships
✅ **Hierarchical Content**: Tutorials with multiple sections
✅ **SEO Optimization**: Slugs, descriptions, keywords

---

## 🛡️ Security Configuration

### Row Level Security Policies

The schema includes RLS policies that:
- Allow public read access to published tutorials
- Allow public read access to visible sections
- Prevent direct write access from frontend
- Allow admin operations via service role key

### API Security

- **anon key**: For frontend/public API calls
- **service_role key**: For admin operations (migration script)
- **JWT authentication**: Ready for user authentication features

---

## 🚀 Performance Optimizations

### Database Indexes

```sql
-- Performance indexes already created:
idx_tutorials_category      -- Fast category filtering
idx_tutorials_status       -- Published content filtering  
idx_tutorials_order        -- Ordered content retrieval
idx_sections_tutorial_id   -- Fast section lookups
idx_sections_order         -- Ordered section retrieval
```

### Caching Strategy

- **Backend**: Tutorial service includes caching
- **Frontend**: Supabase client includes automatic caching
- **CDN**: Tutorial content can be cached at CDN level

### Query Optimization

- Use `tutorial_summary` view for listing pages
- Load sections only when needed
- Paginated results for large datasets
- Efficient search with PostgreSQL full-text search

---

## 📈 Analytics & Monitoring

### Built-in Analytics

The system tracks:
- **View counts** per tutorial
- **Unique visitors** (basic tracking)
- **Read time** estimates
- **Popular content** identification

### Supabase Dashboard

Monitor via Supabase dashboard:
- **Database usage** and performance
- **API requests** and response times
- **Real-time** activity monitoring
- **Log analysis** for debugging

---

## 🔄 Content Management

### Adding New Tutorials

1. **Add to migration script**: Update `tutorial_files` in `migrate_tutorials.py`
2. **Create markdown file**: Follow existing format in `/docs`
3. **Run migration**: `python3 scripts/migrate_tutorials.py`

### Updating Existing Content

1. **Edit markdown file**: Make changes in `/docs`
2. **Re-run migration**: Script handles updates automatically
3. **Version control**: Git tracks content changes

### Content Workflow

```
Markdown Files → Migration Script → Supabase → API → Frontend
     ↓              ↓                ↓        ↓       ↓
   Editing      Processing        Storage   Serving  Display
```

---

## ⚠️ Troubleshooting

### Common Issues

**❌ Migration fails with authentication error:**
```
Solution: Check SUPABASE_SERVICE_ROLE_KEY in .env file
```

**❌ Frontend can't load tutorials:**
```
Solution: Verify NEXT_PUBLIC_SUPABASE_* variables in .env.local
```

**❌ Database connection fails:**
```
Solution: Check Supabase project status and URL format
```

**❌ RLS policies block access:**
```
Solution: Ensure tutorials have status='published'
```

### Debug Steps

1. **Check environment variables**: Both backend and frontend
2. **Verify Supabase project**: Dashboard should show tables
3. **Test API directly**: Use curl commands above
4. **Check browser console**: For frontend errors
5. **Review server logs**: Backend error messages

---

## 🎯 Next Steps

### Immediate Actions

1. ✅ Setup Supabase project
2. ✅ Configure environment variables  
3. ✅ Run database schema
4. ✅ Migrate tutorial content
5. ✅ Test API endpoints

### Future Enhancements

- **User Authentication**: Add user management
- **Content Editing**: Admin interface for content management
- **Advanced Analytics**: Detailed user behavior tracking
- **Content Versioning**: Track content changes over time
- **Multi-language**: Support for multiple languages
- **Real-time Updates**: Live content updates without refresh

---

> **💡 Success Indicators**: When setup is complete, your website will load tutorial content from Supabase database instead of markdown files, resulting in faster loading times and better search functionality.

**🔗 Related Files:**
- [Database Schema](../backend/database/schema.sql)
- [Migration Script](../backend/scripts/migrate_tutorials.py)  
- [Supabase Config](../backend/app/core/supabase.py)
- [API Routes](../backend/app/routes/tutorials.py)
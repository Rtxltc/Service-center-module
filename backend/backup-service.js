const db = require('./db');

async function runBackup() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('❌ DISCORD_WEBHOOK_URL is not set. Skipping database backup.');
    return { success: false, error: 'DISCORD_WEBHOOK_URL is not set' };
  }

  console.log('📦 Starting database backup...');

  try {
    // Fetch all tables in parallel
    const [
      repairsRes,
      contactsRes,
      motoRepairsRes,
      laptopRepairsRes,
      expensesRes
    ] = await Promise.all([
      db.query('SELECT * FROM repairs'),
      db.query('SELECT * FROM contacts'),
      db.query('SELECT * FROM moto_repairs'),
      db.query('SELECT * FROM laptop_repairs'),
      db.query('SELECT * FROM expenses')
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      database_type: db.isSupabase ? 'Supabase' : (db.pool ? 'PostgreSQL' : 'Mock-DB'),
      tables: {
        repairs: repairsRes.rows || [],
        contacts: contactsRes.rows || [],
        moto_repairs: motoRepairsRes.rows || [],
        laptop_repairs: laptopRepairsRes.rows || [],
        expenses: expensesRes.rows || []
      }
    };

    const backupJson = JSON.stringify(backupData, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `service_center_backup_${dateStr}.json`;

    console.log(`📤 Uploading backup to Discord: ${filename}...`);

    // Construct FormData for multipart upload
    const formData = new FormData();
    const fileBlob = new Blob([backupJson], { type: 'application/json' });
    formData.append('files[0]', fileBlob, filename);
    formData.append('content', `🤖 **Database Backup successfully generated**\n📅 **Date:** ${dateStr}\n💾 **Records Backup Summary:**\n- Repairs: ${backupData.tables.repairs.length}\n- Contacts: ${backupData.tables.contacts.length}\n- Moto Repairs: ${backupData.tables.moto_repairs.length}\n- Laptop Repairs: ${backupData.tables.laptop_repairs.length}\n- Expenses: ${backupData.tables.expenses.length}`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Discord Webhook responded with status ${response.status}: ${responseText}`);
    }

    console.log('✅ Database backup uploaded successfully to Discord!');
    return { success: true, filename, summary: backupData.tables };
  } catch (error) {
    console.error('❌ Database backup failed:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { runBackup };

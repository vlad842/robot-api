import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_URL = 'https://makers-challenge.altscore.ai/v1/s1/e8/actions/door';
const API_KEY = '6b9f4cdf10234d13b84fa62ec784a90a';
const decodedWordsFile = path.join(__dirname, 'decoded_words.txt');

const collectedWords: string[] = [];

function decodeBase64(str: string): string {
  return Buffer.from(str, 'base64').toString('utf-8');
}

let currentCookie: string | null = null;

export async function collectWords() {
  console.log('Starting word collection...');
  let consecutiveNoNewWords = 0;

  while (consecutiveNoNewWords < 3) {
    try {
      const headers: any = {
        'API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (currentCookie) {
        headers['Cookie'] = `gryffindor=${currentCookie}`;
      }

      const response = await axios.post(API_URL, {}, { headers });

      if (response.status === 200) {
        console.log('Raw response:', JSON.stringify(response.headers, null, 2));

        const setCookieHeader = response.headers['set-cookie'];

        if (!setCookieHeader || setCookieHeader.length === 0) {
          console.log('No set-cookie header found — assuming no more words to collect.');
          break;
        }

        // 🧠 Accept both quoted and unquoted cookie formats
        const match = setCookieHeader[0].match(/gryffindor="?([^";\s]+)"?/);
        if (match) {
          const encoded = match[1];
          const decoded = Buffer.from(encoded, 'base64').toString('utf-8');

          console.log('Base64 word:', `"${encoded}"`);
          console.log('New word:', decoded);

          if (!collectedWords.includes(decoded)) {
            collectedWords.push(decoded);
            fs.appendFileSync(decodedWordsFile, decoded + ' ');
            currentCookie = encoded;
            consecutiveNoNewWords = 0;
          } else {
            console.log('Duplicate word, skipping...');
            consecutiveNoNewWords++;
          }
        } else {
          console.warn('No gryffindor cookie found in header.');
          break;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 700));
    } catch (err: any) {
      console.error('Request failed:', err?.response?.status || err.message);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n✅ Final message:');
  console.log(collectedWords.join(' '));
  console.log('\n📝 Total unique words collected:', collectedWords.length);
}



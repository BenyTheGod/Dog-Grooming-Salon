# Email Setup Guide - EmailJS

## Step 1: Sign up for EmailJS

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (200 emails/month free)
3. Verify your email address

## Step 2: Add Email Service

1. Go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Copy your **Service ID** (you'll need this)

## Step 3: Create Email Templates

### Template 1: Customer Confirmation Email

1. Go to **Email Templates** → **Create New Template**
2. Name it: "Customer Booking Confirmation"
3. Set **Subject**: `Foglalás megerősítése - Bűbáj Kutyakozmetika`
4. Use this template:

```
Kedves {{to_name}}!

Köszönjük, hogy nálunk foglalt időpontot!

Foglalás részletei:
- Szolgáltatás: {{service}}
- Dátum: {{date_formatted}}
- Kutya neve: {{dog_name}}
- Kutya fajtája: {{dog_breed}}
- Kutya mérete: {{dog_size}}
{% if special_notes != "Nincs" %}
- Megjegyzések: {{special_notes}}
{% endif %}

Várjuk szeretettel a {{date}} napon, {{time}} órakor!

Üdvözlettel,
Bűbáj-Kutyakozmetika
9028 Győr, Jereváni út 39
Telefon: +36 70 414 7199
```

5. Copy the **Template ID**

### Template 2: Business Notification Email

1. Create another template: "Business Booking Notification"
2. Set **Subject**: `Új foglalás: {{dog_name}} - {{date}} {{time}}`
3. Use this template:

```
Új foglalás érkezett!

Tulajdonos adatai:
- Név: {{owner_name}}
- Email: {{owner_email}}
- Telefon: {{owner_phone}}

Foglalás részletei:
- Szolgáltatás: {{service}}
- Dátum: {{date_formatted}}
- Kutya neve: {{dog_name}}
- Kutya fajtája: {{dog_breed}}
- Kutya mérete: {{dog_size}}
{% if special_notes != "Nincs" %}
- Megjegyzések: {{special_notes}}
{% endif %}
```

4. Copy the **Template ID**

## Step 4: Get Your Public Key

1. Go to **Account** → **General**
2. Find **Public Key**
3. Copy it

## Step 5: Update JavaScript Configuration

Open `js/script.js` and replace these values (around line 12-16):

```javascript
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID_HERE';
const EMAILJS_CUSTOMER_TEMPLATE_ID = 'YOUR_CUSTOMER_TEMPLATE_ID_HERE';
const EMAILJS_BUSINESS_TEMPLATE_ID = 'YOUR_BUSINESS_TEMPLATE_ID_HERE';
const BUSINESS_EMAIL = 'your-actual-business-email@gmail.com';
```

## Step 6: Test

1. Make a test booking
2. Check your email (both customer and business)
3. Check EmailJS dashboard → **Logs** to see if emails were sent

## Troubleshooting

- If emails don't send, check the browser console (F12) for errors
- Verify all IDs and keys are correct
- Check EmailJS dashboard logs for delivery status
- Make sure your email service is properly connected in EmailJS


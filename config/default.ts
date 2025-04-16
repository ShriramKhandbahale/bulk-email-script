import 'dotenv/config'

export default {
  email: {
    senderEmail: process.env.SMTP_USER,
    appPassword: process.env.SMTP_PASS,
    qrId: true
  },
  template: {
    logo: 'https://c2w85ig2lt.ufs.sh/f/elHNGJqHN4xJjDk65sGr25gqFBStewTny4XvmPMYZkRpN6WL',
    accent: ['#58551E', '#FFE6D5'],
    orgTitle: 'Mumbai Bookies',
    orgDescription: 'Reading Community',
  }
}
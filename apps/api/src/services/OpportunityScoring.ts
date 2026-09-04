import { BusinessResult } from './MockBusinessProvider';

export class OpportunityScoringService {
  calculateScore(business: BusinessResult): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    if (!business.websites || business.websites.length === 0) { score += 20; reasons.push('+20 No website detected'); }
    const hasBooking = business.websites.some(w => w.bookingProvider);
    if (hasBooking) { score += 15; reasons.push('+15 Third-party booking detected'); }
    const hasLinktree = business.signals.some(s => s.type === 'LINKTREE_DETECTED');
    if (hasLinktree) { score += 15; reasons.push('+15 Linktree detected'); }
    const hasWebsiteIssues = business.signals.some(s => s.type === 'POTENTIAL_WEBSITE_ISSUE');
    if (hasWebsiteIssues) { score += 10; reasons.push('+10 Potential website improvement needed'); }
    const hasPhone = business.contacts.some(c => c.type === 'phone');
    if (hasPhone) { score += 10; reasons.push('+10 Phone available'); }
    const hasEmail = business.contacts.some(c => c.type === 'email');
    if (hasEmail) { score += 10; reasons.push('+10 Email available'); }
    if (business.socials && business.socials.length > 0) { score += 5; reasons.push('+5 Social presence'); }
    if (business.employeeRange === '1-10' || business.employeeCount === 5) { score += 5; reasons.push('+5 Small business'); }
    if (business.websites.length > 0 && !hasWebsiteIssues) { score -= 10; reasons.push('-10 Excellent website'); }
    score = Math.max(0, Math.min(100, score));
    return { score, reasons };
  }
  getScoreCategory(score: number): string {
    if (score >= 90) return 'Very High';
    if (score >= 75) return 'High';
    if (score >= 60) return 'Medium';
    if (score >= 40) return 'Low/Medium';
    return 'Low';
  }
}

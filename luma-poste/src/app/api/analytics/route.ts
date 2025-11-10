import { NextRequest, NextResponse } from 'next/server';
import { scheduleService } from '@/lib/firestore';
import { FieldValue } from 'firebase-admin/firestore';

// Fonction utilitaire pour convertir les dates Firestore
const convertFirestoreDate = (date: FieldValue | Date | string): Date => {
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === 'string') {
    return new Date(date);
  }
  // Pour FieldValue, on assume que c'est un Timestamp
  if (date && typeof date === 'object' && 'toDate' in date) {
    return (date as { toDate: () => Date }).toDate();
  }
  return new Date();
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeRange = searchParams.get('timeRange') || '7d';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      );
    }


    // Calculer la date de début selon la période
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Récupérer tous les posts de l'utilisateur
    const schedules = await scheduleService.getByUserId(userId);
    
    // Filtrer les posts publiés dans la période
    const publishedPosts = schedules.filter(schedule => {
      const createdAt = convertFirestoreDate(schedule.createdAt);
      return schedule.status === 'published' && createdAt >= startDate;
    });

    // Calculer les données de la période précédente pour les pourcentages
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    
    switch (timeRange) {
      case '7d':
        previousStartDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        previousStartDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        previousStartDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        previousStartDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const previousPublishedPosts = schedules.filter(schedule => {
      const createdAt = convertFirestoreDate(schedule.createdAt);
      return schedule.status === 'published' && createdAt >= previousStartDate && createdAt < previousEndDate;
    });

    // Calculer les statistiques actuelles
    const totalPosts = publishedPosts.length;
    const totalViews = publishedPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalLikes = publishedPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalComments = publishedPosts.reduce((sum, post) => sum + (post.comments || 0), 0);
    const totalShares = publishedPosts.reduce((sum, post) => sum + (post.shares || 0), 0);
    
    // Calculer les statistiques de la période précédente
    const previousTotalPosts = previousPublishedPosts.length;
    const previousTotalViews = previousPublishedPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    const previousTotalLikes = previousPublishedPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const previousTotalComments = previousPublishedPosts.reduce((sum, post) => sum + (post.comments || 0), 0);
    const previousTotalShares = previousPublishedPosts.reduce((sum, post) => sum + (post.shares || 0), 0);
    
    // Calculer les pourcentages de changement
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const postsChange = calculatePercentageChange(totalPosts, previousTotalPosts);
    const viewsChange = calculatePercentageChange(totalViews, previousTotalViews);
    const likesChange = calculatePercentageChange(totalLikes, previousTotalLikes);
    const commentsChange = calculatePercentageChange(totalComments, previousTotalComments);
    const sharesChange = calculatePercentageChange(totalShares, previousTotalShares);
    
    // Calculer le taux d'engagement
    const totalEngagement = totalLikes + totalComments + totalShares;
    const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
    
    const previousTotalEngagement = previousTotalLikes + previousTotalComments + previousTotalShares;
    const previousEngagementRate = previousTotalViews > 0 ? (previousTotalEngagement / previousTotalViews) * 100 : 0;
    const engagementChange = calculatePercentageChange(engagementRate, previousEngagementRate);

    // Top posts (par engagement)
    const topPosts = publishedPosts
      .map(post => ({
        id: post.id,
        title: post.caption || 'Sans titre',
        platform: post.platforms?.[0] || 'Inconnu',
        views: post.views || 0,
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        engagement: post.views && post.views > 0 ? ((post.likes || 0) + (post.comments || 0) + (post.shares || 0)) / post.views * 100 : 0,
        createdAt: convertFirestoreDate(post.createdAt)
      }))
      .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
      .slice(0, 10);

    // Posts par plateforme
    const postsByPlatform: Record<string, number> = {};
    publishedPosts.forEach(post => {
      post.platforms?.forEach((platform: string) => {
        postsByPlatform[platform] = (postsByPlatform[platform] || 0) + 1;
      });
    });

    // Posts par jour (derniers 7 jours)
    const postsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPosts = publishedPosts.filter(post => {
        const createdAt = convertFirestoreDate(post.createdAt);
        return createdAt >= dayStart && createdAt <= dayEnd;
      });

      postsByDay.push({
        date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        count: dayPosts.length
      });
    }

    // Statistiques des posts programmés
    const scheduledPosts = schedules.filter(schedule => schedule.status === 'scheduled');
    const draftPosts = schedules.filter(schedule => schedule.status === 'draft');
    const failedPosts = schedules.filter(schedule => schedule.status === 'failed');
    const queuedPosts = schedules.filter(schedule => schedule.status === 'queued');

    // Posts programmés par statut
    const postsByStatus = {
      published: publishedPosts.length,
      scheduled: scheduledPosts.length,
      draft: draftPosts.length,
      failed: failedPosts.length,
      queued: queuedPosts.length
    };

    // Prochains posts programmés (les 5 prochains)
    const upcomingPosts = scheduledPosts
      .map(post => ({
        id: post.id,
        title: post.caption || 'Sans titre',
        platform: post.platforms?.[0] || 'Inconnu',
        scheduledAt: convertFirestoreDate(post.scheduledAt).toISOString(),
        status: post.status
      }))
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 5);

    const analyticsData = {
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      engagementRate: Math.round(engagementRate * 100) / 100,
      topPosts,
      postsByPlatform,
      postsByDay,
      postsByStatus,
      upcomingPosts,
      // Pourcentages de changement
      changes: {
        posts: postsChange,
        views: viewsChange,
        likes: likesChange,
        comments: commentsChange,
        shares: sharesChange,
        engagement: engagementChange
      }
    };


    return NextResponse.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('=== Erreur lors de la récupération des analytics ===');
    console.error('Type d\'erreur:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Message:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

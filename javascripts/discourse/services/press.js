import { tracked } from "@glimmer/tracking";
import Service, { service } from "@ember/service";

export default class Press extends Service {
  @service store;

  @tracked hotTopics = [];
  @tracked latestTopics = [];
  @tracked categoryHotTopics = [];
  @tracked hotTopicsHasNoImages = false;

  @tracked isLoadingHot = false;
  @tracked isLoadingLatest = false;
  @tracked isLoadingCategories = false;

  constructor() {
    super(...arguments);
    this.loadTopics();
  }

  async loadTopics() {
    const usedTopicIds = new Set();

    // Load hot topics
    this.isLoadingHot = true;
    try {
      this.hotTopics = await this.fetchTopics("/hot.json", 4, usedTopicIds, {
        prioritizeImages: true,
        markAsUsed: true,
      });
      this.hotTopicsHasNoImages = !this.hotTopics.some((t) => t.image_url);
    } catch (error) {
      console.error("Error loading hot topics:", error);
    } finally {
      this.isLoadingHot = false;
    }

    // Load latest topics
    this.isLoadingLatest = true;
    try {
      this.latestTopics = await this.fetchTopics(
        "/latest.json",
        settings.latest_topic_count,
        usedTopicIds,
        {
          prioritizeImages: false,
          markAsUsed: true,
        }
      );
    } catch (error) {
      console.error("Error loading latest topics:", error);
    } finally {
      this.isLoadingLatest = false;
    }

    // Load category topics
    this.isLoadingCategories = true;
    try {
      this.categoryHotTopics = await this.fetchHottestTopicsByCategory(
        settings.categories_count,
        5,
        usedTopicIds
      );
    } catch (error) {
      console.error("Error loading category topics:", error);
    } finally {
      this.isLoadingCategories = false;
    }
  }

  // Existing methods remain unchanged
  async fetchTopics(
    endpoint,
    limit,
    excludedIds,
    { prioritizeImages = false, markAsUsed = false } = {}
  ) {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      let allTopics = data.topic_list.topics;

      let usableTopics = allTopics.filter(
        (topic) => !excludedIds.has(topic.id)
      );

      // prioritize images first
      if (prioritizeImages) {
        usableTopics = this.sortByImagePriority(usableTopics);
      }

      usableTopics = usableTopics.slice(0, limit);

      if (markAsUsed) {
        usableTopics.forEach((topic) => excludedIds.add(topic.id));
      }

      return usableTopics;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return [];
    }
  }

  async fetchHottestTopicsByCategory(categoryLimit, topicLimit, usedTopicIds) {
    try {
      const categoriesResponse = await fetch("/categories.json");
      const categoriesData = await categoriesResponse.json();

      // sort categories by topic_count desc, take top N
      const sortedCategories = categoriesData.category_list.categories
        .sort((a, b) => b.topic_count - a.topic_count)
        .slice(0, categoryLimit);

      let categoryTopics = [];

      for (let category of sortedCategories) {
        const categoryRes = await fetch(`/c/${category.slug}/l/hot.json`);
        const categoryData = await categoryRes.json();

        let topics = categoryData.topic_list.topics.filter(
          (topic) => !usedTopicIds.has(topic.id)
        );

        // sort by image
        topics = this.sortByImagePriority(topics).slice(0, topicLimit);

        // check if any have images
        const hasNoImages = !topics.some((t) => t.image_url);

        categoryTopics.push({
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
          },
          topics,
          hasNoImages,
        });
      }

      return categoryTopics;
    } catch (error) {
      console.error("Error fetching hottest topics by category:", error);
      return [];
    }
  }

  sortByImagePriority(topics) {
    // sort so that images appear first
    return [...topics].sort(
      (a, b) => (b.image_url ? 1 : 0) - (a.image_url ? 1 : 0)
    );
  }
}

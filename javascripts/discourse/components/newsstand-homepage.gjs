import Component from "@glimmer/component";
import { service } from "@ember/service";
import { htmlSafe } from "@ember/template";
import { eq } from "truth-helpers";
import ConditionalLoadingSpinner from "discourse/components/conditional-loading-spinner";
import formatDate from "discourse/helpers/format-date";
import hideApplicationSidebar from "discourse/helpers/hide-application-sidebar";
import replaceEmoji from "discourse/helpers/replace-emoji";
import { i18n } from "discourse-i18n";

export default class NewsstandHomepage extends Component {
  @service site;
  @service press;

  <template>
    {{hideApplicationSidebar}}
    <div class="base-grid">
      <div
        class="hero-grid {{if this.press.hotTopicsHasNoImages '--no-images'}}"
      >
        {{#each this.press.hotTopics as |topic index|}}
          <a
            href="/t/{{topic.slug}}/{{topic.id}}/{{topic.last_read_post_number}}"
            class="hero-grid__topic"
            data-index={{index}}
          >
            <h2>{{replaceEmoji topic.title}}</h2>
            <p class="hero-grid__topic-excerpt">
              {{htmlSafe topic.excerpt}}
            </p>
            <div class="hero-grid__topic-date">
              {{formatDate topic.created_at leaveAgo="true"}}
            </div>
            {{#if (eq index 0)}}
              {{#if topic.image_url}}
                <img class="hero-grid__topic-image" src={{topic.image_url}} />
              {{/if}}
            {{/if}}
          </a>
        {{/each}}
      </div>
      <div class="latest-grid">
        <h2><a href="/latest">{{i18n (themePrefix "latest_title")}}</a></h2>
        {{#each this.press.latestTopics as |topic index|}}
          <a
            href="/t/{{topic.slug}}/{{topic.id}}/{{topic.last_read_post_number}}"
            class="latest-grid__topic"
            data-index={{index}}
          >
            <h3>{{replaceEmoji topic.title}}</h3>
            <p class="latest-grid__topic-excerpt">
              {{htmlSafe topic.excerpt}}
            </p>
            <div class="latest-grid__topic-date">
              {{formatDate topic.created_at leaveAgo="true"}}
            </div>
          </a>
        {{/each}}
        <a class="all-latest-link" href="/latest">{{i18n
            (themePrefix "all_latest")
          }}</a>
      </div>

      <div class="categories-grid">

        {{#each this.press.categoryHotTopics as |set|}}
          <div class="categories-grid__category">
            <h2><a href="/c/{{set.category.id}}">{{set.category.name}}</a></h2>
            <div
              class="categories-grid__category-topics
                {{if set.hasNoImages '--no-images'}}"
            >
              {{#each set.topics as |topic index|}}
                <a
                  href="/t/{{topic.slug}}/{{topic.id}}/{{topic.last_read_post_number}}"
                  class="categories-grid__category-topic"
                  data-index={{index}}
                >
                  <h3>{{replaceEmoji topic.title}}</h3>
                  <div class="latest-grid__topic-date">
                    {{formatDate topic.created_at leaveAgo="true"}}
                  </div>
                  {{#if (eq index 0)}}
                    {{#if topic.image_url}}
                      <img
                        class="categories-grid__category-topic-image"
                        src={{topic.image_url}}
                      />
                    {{/if}}

                  {{/if}}

                </a>
              {{/each}}
            </div>

          </div>

        {{/each}}

        <a class="all-categories-link" href="/categories">{{i18n
            (themePrefix "all_categories")
          }}</a>

      </div>
    </div>
  </template>
}

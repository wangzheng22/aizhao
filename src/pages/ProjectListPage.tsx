import { useMemo, useState } from 'react';
import { AppBrandLogo } from '../components/AppBrandLogo';
import { projectListMock } from '../data/projectListMock';
import type { ProjectListItem } from '../types/projectList';
import './ProjectListPage.css';

type ProjectListPageProps = {
  onOpenProject: (item: ProjectListItem) => void;
  onCreateNew: () => void;
};

function normalizeSearch(text: string) {
  return text.trim().toLowerCase();
}

function matchesKeyword(item: ProjectListItem, keyword: string) {
  if (!keyword) return true;
  const hayName = item.projectName.toLowerCase();
  const hayCode = item.projectCode.toLowerCase();
  return hayName.includes(keyword) || hayCode.includes(keyword);
}

export function ProjectListPage({ onOpenProject, onCreateNew }: ProjectListPageProps) {
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    const q = normalizeSearch(keyword);
    return projectListMock.filter((item) => matchesKeyword(item, q));
  }, [keyword]);

  return (
    <div className="project-list-page">
      <header className="project-list-page__topbar">
        <div className="project-list-page__brand">
          <AppBrandLogo />
          <span className="project-list-page__brand-text">智能招标文件编制</span>
        </div>
        <div className="project-list-page__user">
          <span className="project-list-page__avatar" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5.5" r="2.5" fill="white" />
              <path
                d="M3.5 13.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>王磊</span>
        </div>
      </header>

      <main className="project-list-page__main">
        <div className="project-list-page__panel">
          <div className="project-list-page__toolbar">
            <div className="project-list-page__toolbar-start">
              <button type="button" className="project-list-page__create" onClick={onCreateNew}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                新增招标文件
              </button>
            </div>
            <div className="project-list-page__search">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                className="project-list-page__search-input"
                placeholder="搜索项目名称、项目编号"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                aria-label="按项目名称或项目编号搜索"
              />
              {keyword && (
                <button
                  type="button"
                  className="project-list-page__search-clear"
                  aria-label="清空搜索"
                  onClick={() => setKeyword('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="project-list-page__card-table" role="table" aria-label="项目列表">
            <div className="project-list-page__card-head" role="row">
              <div className="project-list-page__cell project-list-page__cell--project" role="columnheader">
                项目
              </div>
              <div className="project-list-page__cell" role="columnheader">
                行业类型
              </div>
              <div className="project-list-page__cell" role="columnheader">
                专业类型
              </div>
              <div className="project-list-page__cell" role="columnheader">
                招标人
              </div>
              <div className="project-list-page__cell" role="columnheader">
                招标方式
              </div>
              <div className="project-list-page__cell" role="columnheader">
                资格审查方式
              </div>
              <div className="project-list-page__cell" role="columnheader">
                上次更新时间
              </div>
              <div
                className="project-list-page__cell project-list-page__cell--action"
                role="columnheader"
              >
                操作
              </div>
            </div>

            <div className="project-list-page__card-list">
              {filtered.length === 0 ? (
                <p className="project-list-page__empty">未找到匹配的项目，请调整搜索关键词</p>
              ) : (
                filtered.map((item) => (
                  <article key={item.id} className="project-list-page__card-row" role="row">
                    <div
                      className="project-list-page__cell project-list-page__cell--project"
                      role="cell"
                    >
                      <div className="project-list-page__project-name" title={item.projectName}>
                        {item.projectName}
                      </div>
                      <div className="project-list-page__project-code">{item.projectCode}</div>
                    </div>
                    <div className="project-list-page__cell" role="cell">
                      {item.industryType}
                    </div>
                    <div className="project-list-page__cell" role="cell">
                      {item.specialtyType}
                    </div>
                    <div className="project-list-page__cell" role="cell">
                      {item.tenderer}
                    </div>
                    <div className="project-list-page__cell" role="cell">
                      {item.bidMethod}
                    </div>
                    <div className="project-list-page__cell" role="cell">
                      {item.qualificationReview}
                    </div>
                    <div
                      className="project-list-page__cell project-list-page__cell--time"
                      role="cell"
                    >
                      {item.updatedAt}
                    </div>
                    <div
                      className="project-list-page__cell project-list-page__cell--action"
                      role="cell"
                    >
                      <button
                        type="button"
                        className="project-list-page__action"
                        onClick={() => onOpenProject(item)}
                      >
                        编制文件
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <footer className="project-list-page__footer">
            共 {filtered.length} 条{keyword ? `（已筛选，总计 ${projectListMock.length} 条）` : ''}
          </footer>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useDispatch, useSelector } from 'react-redux';
import { searchKnowledgeBase } from '../../store/actions/supportActions';

interface KnowledgeBaseSearchProps {
  onEscalateToTicket: () => void;
  onArticleFound: (found: boolean) => void;
}

const KnowledgeBaseSearch: React.FC<KnowledgeBaseSearchProps> = ({
  onEscalateToTicket,
  onArticleFound,
}) => {
  const { colors, spacing, fontSizes } = useTheme();
  const dispatch = useDispatch<any>();
  const { knowledgeBase } = useSelector((state: any) => state.support);
  const { articles, loading, searchQuery } = knowledgeBase;

  const [query, setQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (articles && articles.length > 0) {
      onArticleFound(true);
    } else if (hasSearched && articles && articles.length === 0) {
      onArticleFound(false);
    }
  }, [articles, hasSearched, onArticleFound]);

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
      dispatch(searchKnowledgeBase(query.trim()));
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setSelectedArticle(null);
    setHasSearched(false);
    onArticleFound(false);
  };

  const renderArticleItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.articleItem, { backgroundColor: colors.card }]}
      onPress={() => setSelectedArticle(item)}
    >
      <View style={styles.articleHeader}>
        <Text style={[styles.articleTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.categoryText, { color: colors.primary }]}>
            {item.category}
          </Text>
        </View>
      </View>
      <Text style={[styles.articleSummary, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.summary}
      </Text>
      <View style={styles.articleMeta}>
        <View style={styles.articleStats}>
          <AntDesign name="eye" size={12} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {item.views} views
          </Text>
        </View>
        <View style={styles.articleStats}>
          <AntDesign name="like2" size={12} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {item.helpful_count} helpful
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderArticleDetail = (): React.ReactNode => {
    if (!selectedArticle) return null;
    return (
      <ScrollView style={styles.articleDetail}>
        <View style={styles.articleDetailHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedArticle(null)}
          >
            <AntDesign name="arrowleft" size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.detailTitle, { color: colors.text }]}>
          {selectedArticle.title}
        </Text>
        
        <View style={styles.detailMeta}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {selectedArticle.category}
            </Text>
          </View>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Updated {new Date(selectedArticle.updated_at).toLocaleDateString()}
          </Text>
        </View>
        
        <Text style={[styles.detailContent, { color: colors.text }]}>
          {selectedArticle.content}
        </Text>
        
        <View style={styles.helpfulSection}>
          <Text style={[styles.helpfulTitle, { color: colors.text }]}>
            Was this article helpful?
          </Text>
          <View style={styles.helpfulButtons}>
            <TouchableOpacity style={[styles.helpfulButton, { backgroundColor: colors.success + '20' }]}>
              <AntDesign name="like2" size={16} color={colors.success} />
              <Text style={[styles.helpfulButtonText, { color: colors.success }]}>
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.helpfulButton, { backgroundColor: colors.error + '20' }]}>
              <AntDesign name="dislike2" size={16} color={colors.error} />
              <Text style={[styles.helpfulButtonText, { color: colors.error }]}>
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.escalateButton, { backgroundColor: colors.primary }]}
          onPress={onEscalateToTicket}
        >
          <Text style={[styles.escalateButtonText, { color: colors.white }]}>
            Still need help? Create a ticket
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  if (selectedArticle) {
    return renderArticleDetail();
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Search Knowledge Base
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Find answers to common questions
      </Text>
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for help..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Feather name="search" size={18} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
      
      {hasSearched && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
          <Text style={[styles.clearButtonText, { color: colors.primary }]}>
            Clear search
          </Text>
        </TouchableOpacity>
      )}
      
      {articles && articles.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsTitle, { color: colors.text }]}>
            Found {articles.length} article{articles.length !== 1 ? 's' : ''}
          </Text>
          <FlatList
            data={articles}
            renderItem={renderArticleItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
      
      {hasSearched && articles && articles.length === 0 && !loading && (
        <View style={styles.noResults}>
          <AntDesign name="search1" size={48} color={colors.textSecondary} />
          <Text style={[styles.noResultsTitle, { color: colors.text }]}>
            No articles found
          </Text>
          <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
            We couldn't find any articles matching your search.
          </Text>
          <TouchableOpacity
            style={[styles.createTicketButton, { backgroundColor: colors.primary }]}
            onPress={onEscalateToTicket}
          >
            <Text style={[styles.createTicketButtonText, { color: colors.white }]}>
              Create a Support Ticket
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  searchButton: {
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  articleItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  articleSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  articleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  articleDetail: {
    flex: 1,
  },
  articleDetailHeader: {
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  lastUpdated: {
    fontSize: 12,
  },
  detailContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  helpfulSection: {
    marginBottom: 24,
  },
  helpfulTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  helpfulButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  helpfulButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  escalateButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  escalateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createTicketButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createTicketButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default KnowledgeBaseSearch;

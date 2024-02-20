import clsx from 'clsx';
import { useMemo, useRef } from 'react';
import {
  Avatar as DefaultAvatar,
  ChannelList,
  ChannelPreviewUIComponentProps,
} from 'stream-chat-react';
import type { ChannelFilters, ChannelOptions, ChannelSort } from 'stream-chat';

export const ChannelListWithSearch = (props: { userId: string }) => {
  const { userId } = props;
  const sort: ChannelSort = useMemo(() => ({ last_message_at: -1 }), []);
  const filters: ChannelFilters = useMemo(
    () => ({
      type: 'messaging',
      members: { $in: [userId] },
    }),
    [userId],
  );
  const options: ChannelOptions = useMemo(() => ({ limit: 10 }), []);
  return (
    <div className="channel-list-with-search">
      <div className="channel-search__input__wrapper">
        <div className="channel-search__input__icon">
          <SearchIcon />
        </div>
        <input
          className="channel-search__input__text"
          placeholder="Search"
          type="text"
        />
      </div>
      <ChannelList
        filters={filters}
        sort={sort}
        options={options}
        Preview={CustomChannelPreview}
      />
    </div>
  );
};

const CustomChannelPreview = (props: ChannelPreviewUIComponentProps) => {
  const {
    active,
    Avatar = DefaultAvatar,
    channel,
    className: customClassName = '',
    displayImage,
    displayTitle,
    latestMessage,
    onSelect: customOnSelectChannel,
    setActiveChannel,
    unread,
    watchers,
  } = props;

  const channelPreviewButton = useRef<HTMLButtonElement | null>(null);

  const avatarName =
    displayTitle ||
    channel.state.messages[channel.state.messages.length - 1]?.user?.id;

  const onSelectChannel = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (customOnSelectChannel) {
      customOnSelectChannel(e);
    } else if (setActiveChannel) {
      setActiveChannel(channel, watchers);
    }
    if (channelPreviewButton?.current) {
      channelPreviewButton.current.blur();
    }
  };

  return (
    <button
      aria-label={`Select Channel: ${displayTitle || ''}`}
      aria-selected={active}
      className={clsx(
        `str-chat__channel-preview-messenger str-chat__channel-preview`,
        active && 'str-chat__channel-preview-messenger--active',
        unread && unread >= 1 && 'str-chat__channel-preview-messenger--unread',
        customClassName,
      )}
      data-testid="channel-preview-button"
      onClick={onSelectChannel}
      ref={channelPreviewButton}
      role="option"
    >
      <div className="str-chat__channel-preview-messenger--left">
        <Avatar image={displayImage} name={avatarName} size={40} />
      </div>
      <div className="str-chat__channel-preview-messenger--right str-chat__channel-preview-end">
        <div className="str-chat__channel-preview-end-first-row">
          <div className="str-chat__channel-preview-messenger--name">
            <span>{displayTitle}</span>
          </div>
          {/*{!!unread && (*/}
          {/*  <div*/}
          {/*    className="str-chat__channel-preview-unread-badge"*/}
          {/*    data-testid="unread-badge"*/}
          {/*  >*/}
          {/*    {unread}*/}
          {/*  </div>*/}
          {/*)}*/}
        </div>
        <div className="str-chat__channel-preview-messenger--last-message">
          {typeof latestMessage === 'string'
            ? latestMessage
            : takeLastLineFromText(latestMessage?.props?.children || '...')}
        </div>
      </div>
    </button>
  );
};

const takeLastLineFromText = (text: string) => {
  const lines = text.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() !== '') {
      return lines[i];
    }
  }
  return lines[lines.length - 1];
};

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
  >
    <path
      fill="grey"
      fillOpacity="0.66"
      fillRule="evenodd"
      d="M2.7 6.95a4.25 4.25 0 117.306 2.954 1.001 1.001 0 00-.102.102A4.25 4.25 0 012.7 6.95zm7.906 5.07a6.25 6.25 0 111.414-1.414l2.987 2.987a1 1 0 11-1.414 1.414l-2.987-2.987z"
      clipRule="evenodd"
    ></path>
  </svg>
);

json.feeds(@feeds) do |feed|
  json.image feed.image.url
  json.timestamp feed.created_at
  json.creator do
    json.username feed.creator.username
    json.avatar feed.creator.avatar.url
  end
  json.pets(feed.pets) do |pet|
    json.name pet.name
    json.avatar pet.avatar.url
  end
  if feed.place.present?
    json.place do |place|
      json.placeId feed.place.id
      json.name feed.place.name
      json.latitude feed.place.latitude
      json.longitude feed.place.longitude
    end
  end
  json.pictureId feed.id
  json.liked @user.liked?(feed)
  json.likers(feed.likers) do |liker|
    json.username liker.username
  end
end

FactoryBot.define do
  factory :expense do
    description { "MyString" }
    amount { "9.99" }
    category { nil }
    date { Date.today }
  end
end
